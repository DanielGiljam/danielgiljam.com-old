import chalk from "chalk"

export const throwUnsupportedSourceDirective = (
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

export const throwUnresolvableNonNullableFields = (
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

export const throwMissingSourceConfiguration = (
  id: string,
  sourceConfigName: string,
): void => {
  throw new Error(
    `${chalk.red(
      `Missing source configuration: "${sourceConfigName}".`,
    )} Source directives suggest a source configuration should be present in "${id}".`,
  )
}
