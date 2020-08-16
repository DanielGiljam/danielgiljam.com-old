#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const TSJSONSchemaGenerator = require("ts-json-schema-generator")

const config = {
  tsconfig: path.resolve(__dirname, `..${path.sep}tsconfig.json`),
  type: "PopulateInstructions",
}

const schema = TSJSONSchemaGenerator.createGenerator(config).createSchema(
  config.type,
)

fs.writeFile(
  path.resolve(process.cwd(), "populate-instructions.schema.json"),
  JSON.stringify(schema, undefined, 2),
  (error) => {
    if (error) throw error
    console.info("Success.")
  },
)
