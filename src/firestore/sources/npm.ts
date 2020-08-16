import chalk from "chalk"
import fetch from "isomorphic-unfetch"
import moment from "moment"

import Source, {Fetcher, Parsers} from "../Source"
import {
  fixMDXBreakingBrTags,
  latestReleaseVersionRegex,
  nameRegex,
  removeHeading1,
} from "../admin/util"

export type SupportedField =
  | "name"
  | "description"
  | "latestRelease"
  | "pageContents"

export interface Config {
  name: string
}

interface Response {
  name: string
  "dist-tags": {
    latest?: string
  }
  time: {
    created: string
    modified: string
    [key: string]: string
  }
  description?: string
  readme?: string
}

class NPM extends Source<SupportedField, Config, Response> {
  protected static readonly _FANCY_NAME = "NPM"
  protected static readonly _SUPPORTED_FIELDS_REGEX = /^name|description|latestRelease|pageContents$/
  protected static readonly _PARSERS: Parsers<SupportedField, Response> = {
    name(id, {readme}) {
      if (readme != null) {
        const execResult = nameRegex.exec(readme)
        if (execResult != null) {
          return execResult[0]
        }
      }
      return NPM._THROW_FAILED_ACQUISITION(id, "name")
    },
    description(id, {description}) {
      if (description != null && description.length !== 0) {
        return description
      }
      return NPM._THROW_FAILED_ACQUISITION(id, "description")
    },
    latestRelease(id, npmResponse) {
      const versionRaw = npmResponse["dist-tags"].latest
      if (versionRaw != null) {
        const timestamp = moment.utc(
          npmResponse.time[versionRaw],
          moment.ISO_8601,
        )
        const execResult = latestReleaseVersionRegex.exec(versionRaw)
        if (execResult != null) {
          return {
            version: execResult[0],
            timestamp,
          }
        }
      }
      return NPM._THROW_FAILED_ACQUISITION(id, "latestRelease")
    },
    pageContents(id, {readme}) {
      if (readme != null) {
        const readmeProcessed = readme
          .replace(...removeHeading1)
          .replace(...fixMDXBreakingBrTags)
        if (readmeProcessed.length !== 0) {
          return readmeProcessed
        }
      }
      return NPM._THROW_FAILED_ACQUISITION(id, "pageContents")
    },
  }

  static readonly DIRECTIVE = "_npm"

  protected static readonly _FETCHER: Fetcher<Config, Response> = async (
    id,
    {name},
    networkDumpProperty,
  ) =>
    await fetch(`https://registry.npmjs.com/${name}`).then(async (res) => {
      const json = await res.json()
      networkDumpProperty.npm = json
      if (json == null) {
        throw new Error(
          `${chalk.red(
            "Unable to decode response from NPM",
          )} in "${id}._sources.npm".`,
        )
      }
      return json
    })
}

export default NPM
