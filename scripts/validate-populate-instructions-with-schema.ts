#!/usr/bin/env ts-node-script

import {promises as fs} from "fs"
import path from "path"

import AJV from "ajv"
;(async () => {
  const schema = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, "../populate-instructions.schema.json"),
      "utf-8",
    ),
  )
  const populateInstructions = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, "../populate-instructions.json"),
      "utf-8",
    ),
  )
  const ajv = new AJV()
  const validate = ajv.compile(schema)
  const valid = validate(populateInstructions)
  if (valid === false) console.error(validate.errors)
  else console.info("Valid.")
})().catch((error) => {
  throw error
})
