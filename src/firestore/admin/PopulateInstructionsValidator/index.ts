import path from "path"

import chalk from "chalk"
import {generateSchema, getProgramFromFiles} from "typescript-json-schema"

import {PopulateInstruction} from "../../../../types/data/PopulateInstructions"
import {importSources} from "../util"

import validateTypeDefinitions from "./validateTypeDefinitions"

class PopulateInstructionsValidationError extends Error {}

class PopulateInstructionsValidator {
  private static readonly _PATH_TO_POP_INST_D_TS = path.resolve(
    __dirname,
    "../../../types/data/PopulateInstructions.d.ts",
  )

  private static readonly _PATH_TO_PROJECT_D_TS = path.resolve(
    __dirname,
    "../../../types/data/Project.d.ts",
  )

  constructor() {
    this._initialize().catch((error) => {
      throw error
    })
  }

  private async _initialize(): Promise<void> {
    const sources = await importSources(
      path.resolve(__dirname, `..${path.sep}sources`),
      "../sources",
      ["ts", "js"],
    )
    if (
      !(await validateTypeDefinitions(
        PopulateInstructionsValidator._PATH_TO_POP_INST_D_TS,
        PopulateInstructionsValidator._PATH_TO_PROJECT_D_TS,
        Array.from(sources.keys()),
      ))
    ) {
      throw new Error(
        "Type definitions for Project and PopulateInstructions are outdated/invalid.",
      )
    }
    const program = getProgramFromFiles(
      [PopulateInstructionsValidator._PATH_TO_POP_INST_D_TS],
      {
        esModuleInterop: true,
        lib: ["esnext"],
        removeComments: true,
        skipLibCheck: true,
      },
    )
    const schema = generateSchema(program, "PopulateInstructions", {
      ref: true,
      aliasRef: true,
      topRef: true,
      titles: true,
      defaultProps: true,
      noExtraProps: true,
      required: true,
      strictNullChecks: true,
      excludePrivate: true,
      uniqueNames: true,
      rejectDateType: true,
    })
  }

  async validate(
    id: string,
    instruction: PopulateInstruction,
  ): Promise<PopulateInstruction> {
    if (instruction._sources?.github == null) {
      if (instruction._sources?.npm == null) {
        if (
          instruction.name == null &&
          instruction.description == null &&
          instruction.lifespan == null
        ) {
          PopulateInstructionsValidator._THROW_UNRESOLVABLE_NON_NULLABLE_FIELDS(
            id,
            "name",
            "description",
            "lifespan",
          )
        }
      } else {
        if (instruction.lifespan == null) {
          PopulateInstructionsValidator._THROW_UNRESOLVABLE_NON_NULLABLE_FIELDS(
            id,
            "lifespan",
          )
        }
      }
      if (Object.values(instruction).includes("_github")) {
        PopulateInstructionsValidator._THROW_MISSING_SOURCE_CONFIGURATION(
          id,
          "github",
        )
      }
    }
    if (
      Object.values(instruction).includes("_npm") &&
      instruction._sources?.npm == null
    ) {
      PopulateInstructionsValidator._THROW_MISSING_SOURCE_CONFIGURATION(
        id,
        "npm",
      )
    }
    return instruction
  }

  private static _THROW_UNRESOLVABLE_NON_NULLABLE_FIELDS(
    id: string,
    ...fields: string[]
  ): never {
    throw new PopulateInstructionsValidationError(
      `${chalk.red(
        `Non-nullable field(s) ${fields
          .map((field) => `"${field}"`)
          .join(", ")} lack means to be resolved`,
      )} in "${id}".`,
    )
  }

  private static _THROW_MISSING_SOURCE_CONFIGURATION(
    id: string,
    sourceConfigName: string,
  ): never {
    throw new PopulateInstructionsValidationError(
      `${chalk.red(
        `Missing source configuration: "${sourceConfigName}".`,
      )} Source directives suggest a source configuration should be present in "${id}".`,
    )
  }

  private static _THROW_UNSUPPORTED_SOURCE_DIRECTIVE(
    id: string,
    fieldName: string,
    sourceDirective: string,
  ): never {
    throw new PopulateInstructionsValidationError(
      `${chalk.red(
        `Unsupported source directive: "${sourceDirective}".`,
      )} This source directive cannot be used for field "${fieldName}" in "${id}".`,
    )
  }
}

export default PopulateInstructionsValidator
