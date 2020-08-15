import {promises as fs} from "fs"
import path from "path"

import generateJSONSchema, {JSONSchema} from "./generate-json-schema"

class PopulateInstructionsValidator {
  private static readonly _TS_EXTENSION_MATCHER = /\.ts$/
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
    const potentialSources = await fs.readdir(
      path.resolve(__dirname, "../sources"),
      {
        withFileTypes: true,
      },
    )
    const sources = potentialSources
      .filter(
        (dirent) =>
          dirent.isFile() &&
          PopulateInstructionsValidator._TS_EXTENSION_MATCHER.test(dirent.name),
      )
      .map((dirent) => path.resolve(__dirname, "../sources/" + dirent.name))
    for (const dirent of potentialSources.filter((dirent) =>
      dirent.isDirectory(),
    )) {
      const subDir = await fs.readdir(
        path.resolve(__dirname, "../sources/" + dirent.name),
        {withFileTypes: true},
      )
      const subDirent = await subDir.find(
        (dirent) => dirent.isFile() && dirent.name === "index.ts",
      )
      if (subDirent != null) {
        sources.push(
          path.resolve(
            __dirname,
            `../sources/${dirent.name}/${subDirent.name}`,
          ),
        )
      }
    }
    console.log("sources:", sources)
  }
}

export default PopulateInstructionsValidator
