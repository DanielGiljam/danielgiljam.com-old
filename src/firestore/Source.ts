import chalk from "chalk"

import {NetworkDump} from "../../lib/firestore/populate"
import Project from "../../types/data/Project"

type NetworkDumpProperty = NetworkDump[keyof NetworkDump]

export type Fetcher<C = any, R = any> = (
  id: string,
  config: C,
  networkDumpProperty: NetworkDumpProperty,
) => Promise<R>

export type Parsers<
  S extends Project.FieldName = Project.FieldName,
  R = any
> = {
  [K in S]: (id: string, response: R) => Project.Core[K]
}

class SourceError extends Error {}

abstract class Source<S extends Project.FieldName, C, R> {
  protected static readonly _FANCY_NAME: string
  protected static readonly _SUPPORTED_FIELDS_REGEX: RegExp
  protected static readonly _PARSERS: Partial<Parsers>
  protected static readonly _FETCHER: Fetcher
  static readonly DIRECTIVE: string

  protected readonly _id: string
  protected readonly _config: C

  protected _response?: R

  constructor(id: string, config: C) {
    this._id = id
    this._config = config
  }

  async fetch(networkDumpProperty: NetworkDumpProperty): Promise<void> {
    this._response = await Source._FETCHER(
      this._id,
      this._config,
      networkDumpProperty,
    )
  }

  parse<FN extends S>(fieldName: FN): Project.Core[FN] {
    if (this._response == null) Source._THROW_TOO_EARLY_ACCESS(this._id)
    return (Source._PARSERS[fieldName] as Parsers[Project.FieldName])(
      this._id,
      this._response,
    ) as Project.Core[FN]
  }

  static isParseable(
    fieldName: Project.FieldName,
  ): fieldName is keyof typeof Source._PARSERS {
    return Source._SUPPORTED_FIELDS_REGEX.test(fieldName)
  }

  protected static _THROW_TOO_EARLY_ACCESS(id: string): never {
    throw new SourceError(
      `${chalk.keyword("orange")(
        `Cannot acquire fields from ${Source._FANCY_NAME} before its data has been fetched`,
      )} in "${id}".`,
    )
  }

  protected static _THROW_FAULTY_SOURCE_IMPLEMENTATION(
    id: string,
    fieldName: string,
  ): never {
    throw new SourceError(
      `${chalk.keyword("orange")(
        `The implementation for acquiring fields from ${Source._FANCY_NAME} is faulty its data has been fetched`,
      )} in "${id}".`,
    )
  }

  protected static _THROW_FAILED_ACQUISITION(
    id: string,
    fieldName: string,
  ): never {
    throw new SourceError(
      `${chalk.keyword("orange")(
        `Failed to acquire "${fieldName}" from ${Source._FANCY_NAME}`,
      )} in "${id}".`,
    )
  }
}

export default Source
