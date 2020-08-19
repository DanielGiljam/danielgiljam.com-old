import {promises as fs} from "fs"
import path from "path"

import chalk from "chalk"

type BlockValidator = (sourceName: string) => string

type Validator = BlockValidator[]

interface Validators {
  [key: string]: Validator
}

const poiMarkerStart =
  "\\/\\/ ======> KEEP UP TO DATE! \\(see top of file for more information\\)"
const poiMarkerEnd = "\\/\\/ <====== KEEP UP TO DATE! \\(end\\)"

const poiRegex = new RegExp(
  `(?<=${poiMarkerStart})[\\s\\S]+?(?=${poiMarkerEnd})`,
  "g",
)

const resultHandler = (
  messageWrapper?: (message: string) => string,
  messagesWrapper?: (message: string) => string,
) => (results: Array<PromiseSettledResult<void>>) => {
  const errorMessages: string[] = []
  results.forEach((result) => {
    if (result.status === "rejected") {
      errorMessages.push(
        messageWrapper?.(result.reason.message) ?? result.reason.message,
      )
    }
  })
  if (errorMessages.length !== 0) {
    throw new Error(
      messagesWrapper?.(errorMessages.join("\n")) ?? errorMessages.join("\n"),
    )
  }
}

const throwMissingSourceNamesException = (
  index: number,
  missingSourceNames: string[],
): never => {
  throw new Error(
    chalk.red(
      `${
        missingSourceNames.length > 1 ? "Sources" : "Source"
      } ${missingSourceNames
        .map((name) => chalk.bold(`"${name}"`))
        .join(", ")} ${
        missingSourceNames.length > 1 ? "are" : "is"
      } missing from ${chalk.bold(`${index + 1}. "KEEP UP TO DATE!"`)} block`,
    ),
  )
}

const blockValidatorExecutor = (
  sourceNames: string[],
  blocks: string[],
) => async (blockValidator: BlockValidator, index: number) => {
  const missingSourceNames: string[] = []
  sourceNames.forEach((sourceName) => {
    if (!new RegExp(blockValidator(sourceName), "i").test(blocks[index])) {
      missingSourceNames.push(sourceName)
    }
  })
  if (missingSourceNames.length !== 0) {
    throwMissingSourceNamesException(index, missingSourceNames)
  }
}

const validatorExecutor = (sourceNames: string[]) => async ([
  filePath,
  blockValidators,
  blocks,
]: [string, BlockValidator[], string[]]) =>
  await Promise.allSettled(
    blockValidators.map(blockValidatorExecutor(sourceNames, blocks)),
  ).then(
    resultHandler(
      (message) => `${message} in ${path.relative(process.cwd(), filePath)}.`,
    ),
  )

const throwNumberOfBlocksException = (
  expected: number,
  actual: number,
  filePath: string,
): never => {
  throw new Error(
    `${chalk.red(
      `Expected ${chalk.bold(expected)}, found ${chalk.bold(
        `${actual} "KEEP UP TO DATE!"`,
      )} blocks`,
    )} in ${filePath}.`,
  )
}

const collectBlocks = (file: string): string[] => {
  const matches: string[] = []
  let execResult: RegExpExecArray | null
  while ((execResult = poiRegex.exec(file)) != null) {
    matches.push(execResult[0])
  }
  return matches
}

const getBlocks = async ([filePath, blockValidators]: [
  string,
  BlockValidator[],
]): Promise<[string, BlockValidator[], string[]]> => {
  const file = await fs.readFile(filePath, "utf-8")
  const blocks = collectBlocks(file)
  if (blocks.length !== blockValidators.length) {
    throwNumberOfBlocksException(
      blockValidators.length,
      blocks.length,
      path.relative(process.cwd(), filePath),
    )
  }
  return [filePath, blockValidators, blocks]
}

const validators: Validators = {
  [path.resolve(
    __dirname,
    "../../../../types/data/PopulateInstructions.d.ts",
  )]: [
    (name) =>
      `\\| \\(FN extends ${name}SupportedField \\? typeof ${name}\\.DIRECTIVE : never\\)`,
    (name) => `${name}\\?: ${name}Config`,
  ],
  [path.resolve(__dirname, "../../../../types/data/Project.d.ts")]: [
    (name) => `${name}\\?: Source<${name}Config, D>`,
    (name) => `\\| \\(K extends ${name}SupportedField \\? "${name}" : never\\)`,
  ],
}

const validateTypeDefinitions = async (
  sourceNames: string[],
): Promise<void> => {
  await Promise.allSettled(
    Object.entries(validators).map(
      async (entry) =>
        await getBlocks(entry).then(validatorExecutor(sourceNames)),
    ),
  ).then(
    resultHandler(
      undefined,
      (messages) =>
        `Validation of type definitions failed. See logging output below.\n\n${messages}`,
    ),
  )
}

export default validateTypeDefinitions
