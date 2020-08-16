#!/usr/bin/env ts-node-script

import fs from "fs"
import path from "path"

import {generateSchema, getProgramFromFiles} from "typescript-json-schema"

const program = getProgramFromFiles(
  [path.resolve(__dirname, "../types/data/PopulateInstructions.d.ts")],
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

fs.writeFile(
  path.resolve(process.cwd(), "populate-instructions.schema.json"),
  JSON.stringify(schema, undefined, 2),
  (error) => {
    if (error != null) throw error
    console.info("Success.")
  },
)
