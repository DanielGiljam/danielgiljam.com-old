import {Moment} from "moment"

import {
  Config as GitHubConfig,
  SupportedField as GitHubSupportedField,
} from "../../src/firestore/sources/github"
import {
  Config as NPMConfig,
  SupportedField as NPMSupportedField,
} from "../../src/firestore/sources/npm"

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

declare namespace Project {
  export namespace MetaData {
    export type Source<C, D = Moment> = C & {
      /** When this changes, `._modifiedAt` must change too to the same value as this. */
      refreshedAt: D
    }

    /** More sources may be added in the future. */
    export interface Sources<D = Moment> {
      readonly self: {
        /** When this changes, `._modifiedAt` must change too to the same value as this. */
        modifiedAt: D
      }
      // ======> KEEP UP TO DATE! (see top of file for more information)
      github?: Source<GitHubConfig, D>
      npm?: Source<NPMConfig, D>
      // <====== KEEP UP TO DATE! (end)
    }

    export type SourceMapValue<K extends string> =
      | "self"
      // ======> KEEP UP TO DATE! (see top of file for more information)
      | (K extends GitHubSupportedField ? "github" : never)
      | (K extends NPMSupportedField ? "npm" : never)
    // <====== KEEP UP TO DATE! (end)

    /**
     * Every defined field must have a counterpart within the `SourceMap`.
     * If the "actual" field is undefined, then there may not be a field for it
     * in the `SourceMap`.
     */
    export type SourceMap = {
      [K in keyof Omit<Project.Core, "id">]: SourceMapValue<K>
    }
  }
  export interface MetaData<D = Moment> {
    /**
     * Shall be when document is created in Firestore. `._modifiedAt`, `._sources.self.modifiedAt`
     * and `._sources.{source}.refreshedAt` shall be set at the same time to the same value as this.
     */
    readonly _createdAt: D
    /** Is to be kept in sync with `._sources.self.modifiedAt` and `._sources.{source}.refreshedAt */
    _modifiedAt: D
    readonly _sources: MetaData.Sources<D>
    readonly _sourceMap: MetaData.SourceMap
  }

  export type Id = string
  export type Name = string
  export type Description = string
  export interface Lifespan<D = Moment> {
    begun: D
    ended?: D
  }
  export interface Release<D = Moment> {
    version: string
    timestamp: D
    isPrerelease?: boolean
  }
  export interface Link {
    /** More link types may be added in the future. */
    type: "github" | "npm"
    url: string
  }
  export type PageContents = string | {html?: string; css?: string}
  export interface Download {
    /** More download types may be added in the future. */
    type: "binary"
    /** More platforms may be added in the future. */
    platform: "windows" | "macos"
    url: string
  }

  export interface Core<D = Moment> {
    readonly id: Id
    name: Name
    description: Description
    lifespan: Lifespan<D>
    latestRelease?: Release<D>
    links?: Link[]
    pageContents?: PageContents
    downloads?: Download[]
  }
  export type Full<D = Moment> = Core<D> & MetaData<D>

  export type FieldName = keyof Omit<Core, "id">

  export type DateTypeOf<P extends Project.Flex> = P extends Project.Flex<
    infer D
  >
    ? D
    : never

  export namespace Flex {
    export type Core = Project.Core<any>
    export type Full = Project.Full<any>
  }
  export type Flex<D = any> = Core<D> & Partial<MetaData<D>>
}

export default Project
