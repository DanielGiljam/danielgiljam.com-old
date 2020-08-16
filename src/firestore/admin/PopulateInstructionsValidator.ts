import path from "path"

import chalk from "chalk"

import {PopulateInstruction} from "../../../types/data/PopulateInstructions"

import {importSources} from "./util"

class PopulateInstructionsValidationError extends Error {}

class PopulateInstructionsValidator {
  async initialize(): Promise<void> {
    const sources = await importSources(
      path.resolve(__dirname, `..${path.sep}sources`),
      "../sources",
      ["ts", "js"],
    )
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
