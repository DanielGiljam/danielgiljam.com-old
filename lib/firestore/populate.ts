import {firestore} from "firebase-admin"

import Project from "../../types/data/Project"

type PopulationInstructions = Project.Instruction[]

interface GitHubResponse {}

interface NPMResponse {}

type GitHubParsers = {
  [K in
    | "name"
    | "description"
    | "lifespan"
    | "latestRelease"
    | "pageContents"]: (
    github?: GitHubResponse,
  ) => Project.Firestore.ServerClientLibrary[K]
}

type NPMParsers = {
  [K in "name" | "description" | "latestRelease" | "pageContents"]: (
    npm?: NPMResponse,
  ) => Project.Firestore.ServerClientLibrary[K]
}

const fetchGitHub = async (
  info: Project.Instruction.Sources["github"],
): Promise<GitHubResponse> => {}

const fetchNPM = async (
  info: Project.Instruction.Sources["npm"],
): Promise<NPMResponse> => {}

const githubParsers: GitHubParsers = {
  name() {},
  description() {},
  lifespan() {},
  latestRelease() {},
  pageContents() {},
}

const npmParsers: GitHubParsers = {
  name() {},
  description() {},
  latestRelease() {},
  pageContents() {},
}

const assemble = async (
  instruction: Project.Instruction,
): Promise<Project.Firestore.ServerClientLibrary> => {
  const github =
    instruction._sources?.github != null
      ? await fetchGitHub(instruction._sources.github)
      : undefined
  const npm =
    instruction._sources?.npm != null
      ? await fetchNPM(instruction._sources.npm)
      : undefined
}

const createInstructionExecutor = (
  collRef: firestore.CollectionReference,
  batch: firestore.WriteBatch,
): ((instruction: Project.Instruction) => Promise<void>) => {
  return async (instruction) => {
    const docRef = collRef.doc(instruction.id)
    const projectAssembled = await assemble(instruction)
    batch.set(docRef, projectAssembled)
  }
}

/**
 * This function populates Firestore with documents describing projects.
 * It's very crude:
 *
 * 1. It dumps all existing documents.
 * 2. It doesn't check if the instructions are valid, e.g. if "id" is unique for each project.
 *
 * So just keep that in mind when using this function.
 *
 * @param db Authenticated, initialized Firestore instance.
 * @param instructions Instructions that tell how to populate.
 */
const populate = async (
  db: firestore.Firestore,
  instructions: PopulationInstructions,
): Promise<void> => {
  const collRef = db.collection("projects")
  const batch = db.batch()
  const executeInstructions = createInstructionExecutor(collRef, batch)
  await Promise.all(
    instructions.map(
      async (instruction) => await executeInstructions(instruction),
    ),
  )
  await batch.commit()
}

export default populate
