import path from "path"

import {getImportablePaths} from "../util"

import generateJSONSchema, {JSONSchema} from "./generate-json-schema"

class PopulateInstructionsValidator {
  private _jsonSchema: JSONSchema
  constructor() {
    generateJSONSchema()
      .then((jsonSchema) => {
        this._jsonSchema = jsonSchema
      })
      .catch((error) => {
        throw error
      })
  }

  private async _initialize(): Promise<void> {
    const importPathsForSources = await getImportablePaths(
      path.resolve(__dirname, `..${path.sep}sources`),
      "../sources",
      ["ts", "js"],
    )
  }
}

export default PopulateInstructionsValidator
