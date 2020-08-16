import path from "path"

import {getImportablePaths} from "./util"

class PopulateInstructionsValidator {
  constructor() {
    this._initialize().catch((error) => {
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
