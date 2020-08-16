import GitHub, {
  Config as GitHubConfig,
  SupportedField as GitHubSupportedField,
} from "../../src/firestore/sources/github"
import NPM, {
  Config as NPMConfig,
  SupportedField as NPMSupportedField,
} from "../../src/firestore/sources/npm"

import Project from "./Project"

/**
 * ABOUT THE "KEEP UP TO DATE!" ANNOTATIONS:
 * The annotations outline a region and within that region
 * there should be a line for each Source that resides in
 * the src/firebase/firestore/admin/sources directory.
 *
 * You can expect each Source file to export
 *   - The Source itself (as the default export)
 *   - A "supported fields" type (a named export, named as SupportedField)
 *   - A config type (a named export, named as Config)
 */

/**
 * A "source directive" can be used instead of an actual field value
 * to indicate that the value should be sourced from an external source.
 * This applies only to fields that can have another source than "self".
 */
type PopulateInstructionField<F, FN extends string> =
  | F
  // ======> KEEP UP TO DATE! (see top of file for more information)
  | (FN extends GitHubSupportedField ? typeof GitHub.DIRECTIVE : never)
  | (FN extends NPMSupportedField ? typeof NPM.DIRECTIVE : never)
// <====== KEEP UP TO DATE! (end)

export type PopulateInstruction = Partial<
  {
    [FN in Project.FieldName]: PopulateInstructionField<
      Omit<Project.Core<string>, "id">[FN],
      FN
    >
  }
> & {
  _sources?: {
    // ======> KEEP UP TO DATE! (see top of file for more information)
    github?: GitHubConfig
    npm?: NPMConfig
    // <====== KEEP UP TO DATE! (end)
  }
}

interface PopulateInstructions {
  [key: string]: PopulateInstruction
}

export default PopulateInstructions
