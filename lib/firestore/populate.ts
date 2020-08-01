import {promises as fs} from "fs"
import path from "path"

import {firestore} from "firebase-admin"
import fetch from "isomorphic-unfetch"
import moment from "moment"

import Project from "../../types/data/Project"

interface PopulationInstructions {
  [key: string]: Project.Instruction
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
  readme?: string
}

interface NPMResponse {
  name: string
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
  ) => Project.Firestore.ServerClientLibrary[K]
}

type NPMParseable = "name" | "description" | "latestRelease" | "pageContents"

type NPMParsers = {
  [K in NPMParseable]: (
    id: string,
    npm: NPMResponse,
  ) => Project.Firestore.ServerClientLibrary[K]
}

type FieldName =
  | "name"
  | "description"
  | "lifespan"
  | "latestRelease"
  | "links"
  | "pageContents"
  | "downloads"

let graphqlQuery1: string
let graphqlQuery2: string

const githubFetch1Endpoint = (
  owner: string,
  name: string,
  cursor?: string,
): Parameters<typeof fetch> => [
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
  },
]
const githubFetch2Endpoint = (
  owner: string,
  name: string,
): Parameters<typeof fetch> => [
  `https://raw.githubusercontent.com/${owner}/${name}/master/README.md`,
]

const fetchGitHub = async (
  id: string,
  {
    owner,
    name,
    countLifespanAsStillOngoing,
  }: NonNullable<Project.Instruction.Sources["github"]>,
): Promise<GitHubResponse> => {
  const githubResponse: GitHubResponse = await fetch(
    ...githubFetch1Endpoint(owner, name),
  ).then(async (res) => {
    const json = await res.json()
    if (json?.data?.repository == null) {
      throw new Error(
        `[${id}._source.github] Failed to decode response from GitHub.`,
      )
    }
    return json.data.repository
  })
  const readme = await fetch(...githubFetch2Endpoint(owner, name)).then(
    async (res) => await res.text(),
  )
  githubResponse.readme = readme
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
  {name}: NonNullable<Project.Instruction.Sources["npm"]>,
): Promise<NPMResponse> =>
  await fetch(...npmFetch1Endpoint(name)).then(async (res) => {
    const json = await res.json()
    if (json == null) {
      throw new Error(
        `[${id}._sources.npm] Unable to decode response from NPM.`,
      )
    }
    return json
  })

const githubParseableRegex = /^name|description|lifespan|latestRelease|pageContents$/

const isGitHubParseable = (
  fieldName: FieldName,
): fieldName is GitHubParseable => githubParseableRegex.test(fieldName)

const npmParseableRegex = /^name|description|latestRelease|pageContents$/

const isNPMParseable = (fieldName: FieldName): fieldName is NPMParseable =>
  npmParseableRegex.test(fieldName)

const throwFailedAcquisition = (
  id: string,
  fieldName: string,
  source: string,
): never => {
  throw new Error(`[${id}] Failed to acquire "${fieldName}" from ${source}.`)
}

const githubNameRegex = /(?<=^# ).*/
const githubLatestReleaseVersionRegex = /(?<=v?)\d\.\d\.\d/
const githubPageContentsHeading1Matcher = /^# .*\n*/

const githubParsers: GitHubParsers = {
  name(id, {readme}) {
    if (readme != null) {
      const execResult = githubNameRegex.exec(readme)
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
      const begun = firestore.Timestamp.fromDate(
        moment
          .utc(
            historyNodes[historyNodes.length - 1].authoredDate,
            moment.ISO_8601,
          )
          .toDate(),
      )
      const ended =
        defaultBranchRef.target.authoredDate != null
          ? firestore.Timestamp.fromDate(
              moment
                .utc(defaultBranchRef.target.authoredDate, moment.ISO_8601)
                .toDate(),
            )
          : undefined
      return {begun, ended}
    }
    return throwFailedAcquisition(id, "lifespan", "GitHub")
  },
  latestRelease(id, {releases}) {
    const {tagName, publishedAt, isPrerelease} = releases.nodes[0]
    const execResult = githubLatestReleaseVersionRegex.exec(tagName)
    if (execResult != null) {
      return {
        version: execResult[0],
        timestamp: firestore.Timestamp.fromDate(
          moment(publishedAt, moment.ISO_8601).toDate(),
        ),
        isPrerelease: isPrerelease,
      }
    }
    return throwFailedAcquisition(id, "latestRelease", "GitHub")
  },
  pageContents(id, {readme}) {
    if (readme != null) {
      const readmeWithoutHeading1 = readme.replace(
        githubPageContentsHeading1Matcher,
        "",
      )
      if (readmeWithoutHeading1.length !== 0) {
        return readmeWithoutHeading1
      }
    }
    return throwFailedAcquisition(id, "pageContents", "GitHub")
  },
}

const npmParsers: NPMParsers = {
  name(id, npmResponse) {
    return throwFailedAcquisition(id, "name", "NPM")
  },
  description(id, npmResponse) {
    return throwFailedAcquisition(id, "description", "NPM")
  },
  latestRelease(id, npmResponse) {
    return throwFailedAcquisition(id, "latestRelease", "NPM")
  },
  pageContents(id, npmResponse) {
    return throwFailedAcquisition(id, "pageContents", "NPM")
  },
}

const throwUnsupportedSourceDirective = (
  path: string,
  sourceDirective: string,
): void => {
  throw new Error(
    `[${path}] Unsupported source directive: "${sourceDirective}". This source directive cannot be used for this field.`,
  )
}

const resolve = async <FN extends FieldName>(
  id: string,
  fieldName: FN,
  instruction: Project.Instruction,
  _sourceMap: Project.MetaData.SourceMap,
  github?: GitHubResponse,
  npm?: NPMResponse,
): Promise<Project.Firestore.ServerClientLibrary[FN]> => {
  /**
   * On the explicit type assertions / type system overrides in this function:
   *
   * - The existence of `github` and `npm` was checked earlier (in the `validate` function)
   *   in the cases where they are asserted to not be null.
   * - Thanks to the mapped types of the `githubParsers` and `npmParsers` objects
   *   we can safely assert that the expressions in the return statements will in fact return
   *   the correct type. (Or throw errors, hence the try/catch blocks)
   */
  const fieldValue = instruction[fieldName]
  if (fieldValue != null) {
    if (fieldValue === "_github") {
      if (isGitHubParseable(fieldName)) {
        try {
          return githubParsers[fieldName](
            id,
            github as GitHubResponse,
          ) as Project.Firestore.ServerClientLibrary[FN]
        } catch (error) {
          if (isNPMParseable(fieldName) && npm != null) {
            console.warn(error.message)
            console.warn(`[${id}.${fieldName}] Falling back to NPM...`)
            return npmParsers[fieldName](
              id,
              npm,
            ) as Project.Firestore.ServerClientLibrary[FN]
          } else {
            throw error
          }
        }
      } else {
        throwUnsupportedSourceDirective(`${id}.${fieldName}`, "_github")
      }
    }
    if (fieldValue === "_npm") {
      if (isNPMParseable(fieldName)) {
        try {
          return npmParsers[fieldName](
            id,
            npm as NPMResponse,
          ) as Project.Firestore.ServerClientLibrary[FN]
        } catch (error) {
          if (isGitHubParseable(fieldName) && github != null) {
            console.warn(error.message)
            console.warn(`[${id}.${fieldName}] Falling back to GitHub...`)
            return githubParsers[fieldName](
              id,
              github,
            ) as Project.Firestore.ServerClientLibrary[FN]
          } else {
            throw error
          }
        }
      } else {
        throwUnsupportedSourceDirective(`${id}.${fieldName}`, "_npm")
      }
    }
    // The point of the previous blocks were to conclude
    // that just returning `fieldValue` is okay.
    return fieldValue as Project.Firestore.ServerClientLibrary[FN]
  } else {
    if (isGitHubParseable(fieldName) && github != null) {
      try {
        return githubParsers[fieldName](
          id,
          github,
        ) as Project.Firestore.ServerClientLibrary[FN]
      } catch (error) {
        console.warn(error.message)
      }
    }
    if (isNPMParseable(fieldName) && npm != null) {
      try {
        return npmParsers[fieldName](
          id,
          npm,
        ) as Project.Firestore.ServerClientLibrary[FN]
      } catch (error) {
        console.warn(error.message)
      }
    }
    switch (fieldName) {
      case "name":
      case "description":
      case "lifespan":
        throw new Error(
          `[${id}.${fieldName}] Unable to resolve non-nullable field.`,
        )
      default:
        console.warn(
          `[${id}.${fieldName}] Unable to resolve field. The value of this field will be undefined`,
        )
        return undefined as Project.Firestore.ServerClientLibrary[FN]
    }
  }
}

const assemble = async (
  id: string,
  instruction: Project.Instruction,
): Promise<Project.Firestore.ServerClientLibrary> => {
  const _sourceMap: Project.MetaData.SourceMap = {
    name: "self",
    description: "self",
    lifespan: "self",
  }
  const github =
    instruction._sources?.github != null
      ? await fetchGitHub(id, instruction._sources.github)
      : undefined
  const npm =
    instruction._sources?.npm != null
      ? await fetchNPM(id, instruction._sources.npm)
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
    `[${id}] Non-nullable fields ${fields
      .map((field) => `"${field}"`)
      .join(", ")} lack means to be resolved.`,
  )
}

const throwMissingSourceConfiguration = (
  id: string,
  sourceConfigName: string,
): void => {
  throw new Error(
    `[${id}] Missing source configuration: "${sourceConfigName}". Source directives suggest a source configuration should be present.`,
  )
}

const validate = async (
  id: string,
  instruction: Project.Instruction,
): Promise<Project.Instruction> => {
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
 */
const populate = async (
  db: firestore.Firestore,
  instructions: PopulationInstructions,
): Promise<void> => {
  graphqlQuery1 = await fs.readFile(
    path.resolve(__dirname, "./github-query-1.min.graphql"),
    "utf-8",
  )
  graphqlQuery2 = await fs.readFile(
    path.resolve(__dirname, "./github-query-1.min.graphql"),
    "utf-8",
  )
  const batch = db.batch()
  const collRef = db.collection("projects")
  await Promise.allSettled(
    Object.entries(instructions).map(
      async ([id, instruction]) =>
        await validate(id, instruction)
          .then(async () => await assemble(id, instruction))
          .then((assembledProject) => {
            batch.set(collRef.doc(id), assembledProject)
            return {id, ...assembledProject}
          }),
    ),
  ).then((results) => {
    let abort = false
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const {id, ...assembledProject} = result.value
        console.info(`Assembled "${id}".`)
        console.log(JSON.stringify(assembledProject, undefined, 2))
      } else {
        console.error(result.reason)
        abort = true
      }
    })
    if (abort) {
      throw new Error("Some projects failed to assemble. Batch aborted.")
    }
  })
  await batch.commit()
}

export default populate
