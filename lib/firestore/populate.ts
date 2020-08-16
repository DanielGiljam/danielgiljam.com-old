import {promises as fs} from "fs"
import path from "path"
import {URL} from "url"

import chalk from "chalk"
import {firestore} from "firebase-admin"
import fetch from "isomorphic-unfetch"
import moment from "moment"

import {GitHubConfig} from "../../src/firestore/sources/github"
import {NPMConfig} from "../../src/firestore/sources/npm"
import PopulateInstructions, {
  PopulateInstruction,
} from "../../types/data/PopulateInstructions"
import Project from "../../types/data/Project"

type ProjectToFirestore = Omit<Project.Full<firestore.FieldValue>, "id">

interface PopulateOptions {
  testMode?: boolean
  writeDump?: boolean
  writeNetworkDump?: boolean
}

interface Dump {
  [key: string]: ProjectToFirestore
}

export interface NetworkDump {
  [key: string]: {
    github?: any
    npm?: any
  }
}

interface GitHubResponse {
  description?: string
  defaultBranchRef?: {
    target: {
      authoredDate?: string
      history: {
        nodes: Array<{
          authoredDate: string
        }>
        pageInfo: {
          endCursor: string
          hasNextPage: boolean
        }
      }
    }
  }
  releases: {
    nodes: Array<{
      name: string
      tagName: string
      publishedAt: string
      isPrerelease: boolean
    }>
  }
  pageContents?: {
    readme: string
    url: string
  }
}

interface NPMResponse {
  name: string
  "dist-tags": {
    latest?: string
  }
  time: {
    created: string
    modified: string
    [key: string]: string
  }
  description?: string
  readme?: string
}

type GitHubParseable =
  | "name"
  | "description"
  | "lifespan"
  | "latestRelease"
  | "pageContents"

type GitHubParsers = {
  [K in GitHubParseable]: (
    id: string,
    github: GitHubResponse,
  ) => ProjectToFirestore[K]
}

type NPMParseable = "name" | "description" | "latestRelease" | "pageContents"

type NPMParsers = {
  [K in NPMParseable]: (id: string, npm: NPMResponse) => ProjectToFirestore[K]
}

let graphqlQuery1: string
let graphqlQuery2: string

const githubFetch1Endpoint = (
  owner: string,
  name: string,
  cursor?: string,
): Parameters<typeof fetch> => {
  return [
    "https://api.github.com/graphql",
    {
      method: "post",
      body: JSON.stringify({
        query: cursor == null ? graphqlQuery1 : graphqlQuery2,
        variables: {
          owner,
          name,
          cursor,
        },
      }),
      headers: {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN as string}`,
      },
    },
  ]
}
const githubFetch2Endpoint = (
  owner: string,
  name: string,
): Parameters<typeof fetch> => [
  `https://raw.githubusercontent.com/${owner}/${name}/master/README.md`,
]

const fetchGitHub = async (
  id: string,
  {owner, name, countLifespanAsStillOngoing}: NonNullable<GitHubConfig>,
  networkDumpProperty: NetworkDump[keyof NetworkDump],
): Promise<GitHubResponse> => {
  const githubResponse: GitHubResponse = await fetch(
    ...githubFetch1Endpoint(owner, name),
  ).then(async (res) => {
    const json = await res.json()
    networkDumpProperty.github = json
    if (json?.data?.repository == null) {
      throw new Error(
        `${chalk.red(
          "Unable to decode response from GitHub",
        )} in "${id}._source.github".`,
      )
    }
    return json.data.repository
  })
  const readme = await fetch(...githubFetch2Endpoint(owner, name)).then(
    async (res) => await res.text(),
  )
  if (readme != null && readme.length !== 0) {
    githubResponse.pageContents = {
      readme,
      url: `https://raw.githubusercontent.com/${owner}/${name}/master/`,
    }
  }
  if (githubResponse.defaultBranchRef != null) {
    if (countLifespanAsStillOngoing ?? false) {
      githubResponse.defaultBranchRef.target.authoredDate = undefined
    }
    let hasNextPage =
      githubResponse.defaultBranchRef.target.history.pageInfo.hasNextPage
    if (hasNextPage) {
      let cursor =
        githubResponse.defaultBranchRef.target.history.pageInfo.endCursor
      let defaultBranchRef: NonNullable<GitHubResponse["defaultBranchRef"]>
      do {
        defaultBranchRef = (
          await fetch(...githubFetch1Endpoint(owner, name, cursor)).then(
            async (res) => await res.json(),
          )
        ).data.repository.defaultBranchRef
        hasNextPage = defaultBranchRef.target.history.pageInfo.hasNextPage
        cursor = defaultBranchRef.target.history.pageInfo.endCursor
      } while (hasNextPage)
      githubResponse.defaultBranchRef.target.history =
        defaultBranchRef.target.history
    }
  }
  return githubResponse
}

const npmFetch1Endpoint = (name: string): Parameters<typeof fetch> => [
  `https://registry.npmjs.com/${name}`,
]

const fetchNPM = async (
  id: string,
  {name}: NonNullable<NPMConfig>,
  networkDumpProperty: NetworkDump[keyof NetworkDump],
): Promise<NPMResponse> =>
  await fetch(...npmFetch1Endpoint(name)).then(async (res) => {
    const json = await res.json()
    networkDumpProperty.npm = json
    if (json == null) {
      throw new Error(
        `${chalk.red(
          "Unable to decode response from NPM",
        )} in "${id}._sources.npm".`,
      )
    }
    return json
  })

const githubParseableRegex = /^name|description|lifespan|latestRelease|pageContents$/

const isGitHubParseable = (
  fieldName: Project.FieldName,
): fieldName is GitHubParseable => githubParseableRegex.test(fieldName)

const npmParseableRegex = /^name|description|latestRelease|pageContents$/

const isNPMParseable = (
  fieldName: Project.FieldName,
): fieldName is NPMParseable => npmParseableRegex.test(fieldName)

const throwFailedAcquisition = (
  id: string,
  fieldName: string,
  source: string,
): never => {
  throw new Error(
    `${chalk.keyword("orange")(
      `Failed to acquire "${fieldName}" from ${source}`,
    )} in "${id}".`,
  )
}

const nameRegex = /(?<=^# ).*/
const latestReleaseVersionRegex = /(?<=v?)\d\.\d\.\d/
const pageContentsHeading1Matcher = /^# .*\n*/
const pageContentsMDXBreakingBrTagMatcher = /<br>/g
const pageContentsRelativeImageSourceMatcher = /(?<=!\[.*\]\()(?!https?:\/\/).*(?=\))/g

const utcISO8601StringToFirestore = (dateString: string): firestore.Timestamp =>
  firestore.Timestamp.fromDate(moment.utc(dateString, moment.ISO_8601).toDate())

const githubParsers: GitHubParsers = {
  name(id, {pageContents}) {
    if (pageContents != null) {
      const execResult = nameRegex.exec(pageContents.readme)
      if (execResult != null) {
        return execResult[0]
      }
    }
    return throwFailedAcquisition(id, "name", "GitHub")
  },
  description(id, {description}) {
    if (description != null) {
      return description
    }
    return throwFailedAcquisition(id, "description", "GitHub")
  },
  lifespan(id, {defaultBranchRef}) {
    if (defaultBranchRef != null) {
      const historyNodes = defaultBranchRef.target.history.nodes
      const begun = utcISO8601StringToFirestore(
        historyNodes[historyNodes.length - 1].authoredDate,
      )
      const ended =
        defaultBranchRef.target.authoredDate != null
          ? utcISO8601StringToFirestore(defaultBranchRef.target.authoredDate)
          : undefined
      return {begun, ended}
    }
    return throwFailedAcquisition(id, "lifespan", "GitHub")
  },
  latestRelease(id, {releases}) {
    const {tagName, publishedAt, isPrerelease} = releases.nodes[0] ?? {}
    const execResult = latestReleaseVersionRegex.exec(tagName)
    if (execResult != null) {
      return {
        version: execResult[0],
        timestamp: utcISO8601StringToFirestore(publishedAt),
        isPrerelease,
      }
    }
    return throwFailedAcquisition(id, "latestRelease", "GitHub")
  },
  pageContents(id, {pageContents}) {
    if (pageContents != null) {
      const readme = pageContents.readme
        .replace(pageContentsHeading1Matcher, "")
        .replace(pageContentsMDXBreakingBrTagMatcher, "<br />")
        .replace(pageContentsRelativeImageSourceMatcher, (match) =>
          new URL(match, pageContents.url).toString(),
        )
      if (readme.length !== 0) {
        return readme
      }
    }
    return throwFailedAcquisition(id, "pageContents", "GitHub")
  },
}

const npmParsers: NPMParsers = {
  name(id, {readme}) {
    if (readme != null) {
      const execResult = nameRegex.exec(readme)
      if (execResult != null) {
        return execResult[0]
      }
    }
    return throwFailedAcquisition(id, "name", "NPM")
  },
  description(id, {description}) {
    if (description != null && description.length !== 0) {
      return description
    }
    return throwFailedAcquisition(id, "description", "NPM")
  },
  latestRelease(id, npmResponse) {
    const versionRaw = npmResponse["dist-tags"].latest
    if (versionRaw != null) {
      const timestamp = utcISO8601StringToFirestore(
        npmResponse.time[versionRaw],
      )
      const execResult = latestReleaseVersionRegex.exec(versionRaw)
      if (execResult != null) {
        return {
          version: execResult[0],
          timestamp,
        }
      }
    }
    return throwFailedAcquisition(id, "latestRelease", "NPM")
  },
  pageContents(id, {readme}) {
    if (readme != null) {
      const readmeProcessed = readme
        .replace(pageContentsHeading1Matcher, "")
        .replace(pageContentsMDXBreakingBrTagMatcher, "<br />")
      if (readmeProcessed.length !== 0) {
        return readmeProcessed
      }
    }
    return throwFailedAcquisition(id, "pageContents", "NPM")
  },
}

const throwUnsupportedSourceDirective = (
  id: string,
  fieldName: string,
  sourceDirective: string,
): void => {
  throw new Error(
    `${chalk.red(
      `Unsupported source directive: "${sourceDirective}".`,
    )} This source directive cannot be used for field "${fieldName}" in "${id}".`,
  )
}

const resolve = async <FN extends Project.FieldName>(
  id: string,
  fieldName: FN,
  instruction: PopulateInstruction,
  _sourceMap: Project.MetaData.SourceMap,
  github?: GitHubResponse,
  npm?: NPMResponse,
): Promise<ProjectToFirestore[FN]> => {
  const fieldValue = instruction[fieldName]
  if (fieldValue != null) {
    if (fieldValue === "_github") {
      if (isGitHubParseable(fieldName)) {
        try {
          const resolvedValue = githubParsers[fieldName](
            id,
            github as GitHubResponse,
          ) as ProjectToFirestore[FN]
          _sourceMap[fieldName] = "github"
          return resolvedValue
        } catch (error) {
          if (isNPMParseable(fieldName) && npm != null) {
            console.warn(error.message)
            console.warn(
              `${chalk.keyword("orange")(
                "Falling back to NPM",
              )} with "${id}.${fieldName}".`,
            )
            const resolvedValue = npmParsers[fieldName](
              id,
              npm,
            ) as ProjectToFirestore[FN]
            _sourceMap[fieldName] = "npm"
            return resolvedValue
          } else {
            throw error
          }
        }
      } else {
        throwUnsupportedSourceDirective(id, fieldName, "_github")
      }
    }
    if (fieldValue === "_npm") {
      if (isNPMParseable(fieldName)) {
        try {
          const resolvedValue = npmParsers[fieldName](
            id,
            npm as NPMResponse,
          ) as ProjectToFirestore[FN]
          _sourceMap[fieldName] = "npm"
          return resolvedValue
        } catch (error) {
          if (isGitHubParseable(fieldName) && github != null) {
            console.warn(error.message)
            console.warn(
              `${chalk.keyword("orange")(
                "Falling back to GitHub",
              )} with "${id}.${fieldName}".`,
            )
            const resolvedValue = githubParsers[fieldName](
              id,
              github,
            ) as ProjectToFirestore[FN]
            _sourceMap[fieldName] = "github"
            return resolvedValue
          } else {
            throw error
          }
        }
      } else {
        throwUnsupportedSourceDirective(id, fieldName, "_npm")
      }
    }
    _sourceMap[fieldName] = "self"
    return fieldValue as ProjectToFirestore[FN]
  } else {
    if (isGitHubParseable(fieldName) && github != null) {
      try {
        const resolvedValue = githubParsers[fieldName](
          id,
          github,
        ) as ProjectToFirestore[FN]
        _sourceMap[fieldName] = "github"
        return resolvedValue
      } catch (error) {
        console.warn(error.message)
      }
    }
    if (isNPMParseable(fieldName) && npm != null) {
      try {
        const resolvedValue = npmParsers[fieldName](
          id,
          npm,
        ) as ProjectToFirestore[FN]
        _sourceMap[fieldName] = "npm"
        return resolvedValue
      } catch (error) {
        console.warn(error.message)
      }
    }
    switch (fieldName) {
      case "name":
      case "description":
      case "lifespan":
        throw new Error(
          `${chalk.red(
            `Unable to resolve non-nullable field "${fieldName}"`,
          )} in "${id}".`,
        )
      case "links":
      case "downloads":
        return undefined as ProjectToFirestore[FN]
      default:
        console.warn(
          `${chalk.keyword("orange")(
            `Unable to resolve field "${fieldName}".`,
          )} The value of "${fieldName}" will be undefined in "${id}".`,
        )
        return undefined as ProjectToFirestore[FN]
    }
  }
}

const assemble = async (
  id: string,
  instruction: PopulateInstruction,
  networkDump: NetworkDump,
): Promise<ProjectToFirestore> => {
  const _sourceMap: Project.MetaData.SourceMap = {
    name: "self",
    description: "self",
    lifespan: "self",
  }
  networkDump[id] = {}
  const github =
    instruction._sources?.github != null
      ? await fetchGitHub(id, instruction._sources.github, networkDump[id])
      : undefined
  const npm =
    instruction._sources?.npm != null
      ? await fetchNPM(id, instruction._sources.npm, networkDump[id])
      : undefined
  return {
    name: await resolve(id, "name", instruction, _sourceMap, github, npm),
    description: await resolve(
      id,
      "description",
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    lifespan: await resolve(
      id,
      "lifespan",
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    latestRelease: await resolve(
      id,
      "latestRelease",
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    links: await resolve(id, "links", instruction, _sourceMap, github, npm),
    pageContents: await resolve(
      id,
      "pageContents",
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    downloads: await resolve(
      id,
      "downloads",
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    _createdAt: firestore.FieldValue.serverTimestamp(),
    _modifiedAt: firestore.FieldValue.serverTimestamp(),
    _sources: {
      self: {
        modifiedAt: firestore.FieldValue.serverTimestamp(),
      },
      github:
        instruction._sources?.github != null
          ? {
              refreshedAt: firestore.FieldValue.serverTimestamp(),
              ...instruction._sources.github,
            }
          : undefined,
      npm:
        instruction._sources?.npm != null
          ? {
              refreshedAt: firestore.FieldValue.serverTimestamp(),
              ...instruction._sources?.npm,
            }
          : undefined,
    },
    _sourceMap,
  }
}

const throwUnresolvableNonNullableFields = (
  id: string,
  ...fields: string[]
): void => {
  throw new Error(
    `${chalk.red(
      `Non-nullable field(s) ${fields
        .map((field) => `"${field}"`)
        .join(", ")} lack means to be resolved`,
    )} in "${id}".`,
  )
}

const throwMissingSourceConfiguration = (
  id: string,
  sourceConfigName: string,
): void => {
  throw new Error(
    `${chalk.red(
      `Missing source configuration: "${sourceConfigName}".`,
    )} Source directives suggest a source configuration should be present in "${id}".`,
  )
}

const validate = async (
  id: string,
  instruction: PopulateInstruction,
): Promise<PopulateInstruction> => {
  if (instruction._sources?.github == null) {
    if (instruction._sources?.npm == null) {
      if (
        instruction.name == null &&
        instruction.description == null &&
        instruction.lifespan == null
      ) {
        throwUnresolvableNonNullableFields(
          id,
          "name",
          "description",
          "lifespan",
        )
      }
    } else {
      if (instruction.lifespan == null) {
        throwUnresolvableNonNullableFields(id, "lifespan")
      }
    }
    if (Object.values(instruction).includes("_github")) {
      throwMissingSourceConfiguration(id, "github")
    }
  }
  if (
    Object.values(instruction).includes("_npm") &&
    instruction._sources?.npm == null
  ) {
    throwMissingSourceConfiguration(id, "npm")
  }
  return instruction
}

/**
 * This function populates Firestore with projects (documents describing projects).
 * @param db Authenticated, initialized Firestore instance.
 * @param instructions Instructions that tell how to populate.
 * @param collectionName Name of the collection where the documents will go.
 * @param options Options for toggling test mode and whether to write a dump.
 */
const populate = async (
  db: firestore.Firestore,
  instructions: PopulateInstructions,
  collectionName: string,
  options: PopulateOptions = {},
): Promise<void> => {
  graphqlQuery1 = await fs.readFile(
    path.resolve(__dirname, "./github-query-1.graphql"),
    "utf-8",
  )
  graphqlQuery2 = await fs.readFile(
    path.resolve(__dirname, "./github-query-2.graphql"),
    "utf-8",
  )
  if (process.env.GITHUB_ACCESS_TOKEN == null) {
    throw new Error("Environment variable GITHUB_ACCESS_TOKEN is not defined.")
  }
  db.settings({ignoreUndefinedProperties: true})
  const dump: Dump = {}
  const networkDump: NetworkDump = {}
  const batch = db.batch()
  const collRef = db.collection(collectionName)
  await Promise.allSettled(
    Object.entries(instructions).map(
      async ([id, instruction]) =>
        await validate(id, instruction)
          .then(async () => await assemble(id, instruction, networkDump))
          .then((assembledProject) => {
            dump[id] = assembledProject
            batch.set(collRef.doc(id), assembledProject)
            return {id, ...assembledProject}
          }),
    ),
  ).then((results) => {
    let abort = false
    let fulfilled = 0
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        console.info(`Assembled "${result.value.id}".`)
        fulfilled++
      } else {
        console.error(result.reason.message)
        abort = true
      }
    })
    console.info(`${fulfilled}/${results.length} projects assembled.`)
    if (abort) {
      throw new Error("Some projects failed to assemble. Batch aborted.")
    }
  })
  if (options.writeDump ?? false) {
    console.info("Writing dump.")
    await fs.writeFile(
      path.resolve(process.cwd(), "./populate-dump.json"),
      JSON.stringify(dump, undefined, 2),
    )
  }
  if (options.writeNetworkDump ?? false) {
    console.info("Writing network dump.")
    await fs.writeFile(
      path.resolve(process.cwd(), "./network-dump.json"),
      JSON.stringify(networkDump, undefined, 2),
    )
  }
  if (options.testMode ?? false) return
  await batch.commit()
}

export default populate
