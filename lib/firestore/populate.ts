import {firestore} from "firebase-admin"

import Project from "../../types/data/Project"

interface PopulationInstructions {
  [key: string]: Project.Instruction
}

interface GitHubResponse {}

interface NPMResponse {}

type GitHubParseable =
  | "name"
  | "description"
  | "lifespan"
  | "latestRelease"
  | "pageContents"

type GitHubParsers = {
  [K in GitHubParseable]: (
    github: GitHubResponse,
  ) => Project.Firestore.ServerClientLibrary[K]
}

type NPMParseable = "name" | "description" | "latestRelease" | "pageContents"

type NPMParsers = {
  [K in NPMParseable]: (
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

const fetchGitHub = async (
  info: Project.Instruction.Sources["github"],
): Promise<GitHubResponse> => {}

const fetchNPM = async (
  info: Project.Instruction.Sources["npm"],
): Promise<NPMResponse> => {}

const githubParseableRegex = /^name|description|lifespan|latestRelease|pageContents$/

const isGitHubParseable = (
  fieldName: FieldName,
): fieldName is GitHubParseable => githubParseableRegex.test(fieldName)

const npmParseableRegex = /^name|description|latestRelease|pageContents$/

const isNPMParseable = (fieldName: FieldName): fieldName is NPMParseable =>
  npmParseableRegex.test(fieldName)

const githubParsers: GitHubParsers = {
  name() {},
  description() {},
  lifespan() {},
  latestRelease() {},
  pageContents() {},
}

const npmParsers: NPMParsers = {
  name() {},
  description() {},
  latestRelease() {},
  pageContents() {},
}

const conclude = async <FN extends FieldName>(
  fieldName: FN,
  id: string,
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
            github as GitHubResponse,
          ) as Project.Firestore.ServerClientLibrary[FN]
        } catch (error) {
          if (isNPMParseable(fieldName) && npm != null) {
            console.warn(error.message)
            console.warn("Falling back to NPM...")
            return npmParsers[fieldName](
              npm,
            ) as Project.Firestore.ServerClientLibrary[FN]
          } else {
            throw error
          }
        }
      } else {
        throw new Error(
          `You cannot set the source of "${fieldName}" to GitHub. (In "${id}".)`,
        )
      }
    }
    if (fieldValue === "_npm") {
      if (isNPMParseable(fieldName)) {
        try {
          return npmParsers[fieldName](
            npm as NPMResponse,
          ) as Project.Firestore.ServerClientLibrary[FN]
        } catch (error) {
          if (isGitHubParseable(fieldName) && github != null) {
            console.warn(error.message)
            console.warn("Falling back to GitHub...")
            return githubParsers[fieldName](
              github,
            ) as Project.Firestore.ServerClientLibrary[FN]
          } else {
            throw error
          }
        }
      } else {
        throw new Error(
          `You cannot set the source of "${fieldName}" to NPM. (In "${id}".)`,
        )
      }
    }
    // The point of the previous blocks were to conclude
    // that just returning `fieldValue` is okay.
    return fieldValue as Project.Firestore.ServerClientLibrary[FN]
  } else {
    if (isGitHubParseable(fieldName) && github != null) {
      try {
        return githubParsers[fieldName](
          github,
        ) as Project.Firestore.ServerClientLibrary[FN]
      } catch (error) {
        console.warn(error.message)
      }
    }
    if (isNPMParseable(fieldName) && npm != null) {
      try {
        return npmParsers[fieldName](
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
          `Unable to acquire required field "${fieldName}" of "${id}" from any source.`,
        )
      default:
        console.warn(
          `Unable to acquire "${fieldName}" of "${id}" from any source. The field will be undefined.`,
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
      ? await fetchGitHub(instruction._sources.github)
      : undefined
  const npm =
    instruction._sources?.npm != null
      ? await fetchNPM(instruction._sources.npm)
      : undefined
  return {
    name: await conclude("name", id, instruction, _sourceMap, github, npm),
    description: await conclude(
      "description",
      id,
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    lifespan: await conclude(
      "lifespan",
      id,
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    latestRelease: await conclude(
      "latestRelease",
      id,
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    links: await conclude("links", id, instruction, _sourceMap, github, npm),
    pageContents: await conclude(
      "pageContents",
      id,
      instruction,
      _sourceMap,
      github,
      npm,
    ),
    downloads: await conclude(
      "downloads",
      id,
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
        throw new Error(
          `"${id}" needs to have either sources or the fields "name", "description" and "lifespan" specified.`,
        )
      }
    } else {
      if (instruction.lifespan == null) {
        throw new Error(
          `"${id}" needs to have "lifespan" specified or a source from which "lifespan" can be acquired.`,
        )
      }
    }
    if (Object.values(instruction).includes("_github")) {
      throw new Error(
        `A field in "${id}" uses GitHub as a source but GitHub isn't specified in "_sources".`,
      )
    }
  }
  if (
    Object.values(instruction).includes("_npm") &&
    instruction._sources?.npm == null
  ) {
    throw new Error(
      `A field in "${id}" uses NPM as a source but NPM isn't specified in "_sources".`,
    )
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
