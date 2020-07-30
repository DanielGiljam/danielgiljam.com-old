import {firestore} from "firebase-admin"

declare namespace Project {
  export namespace Instruction {
    /** More sources may be added in the future. */
    export interface Sources {
      github?: {
        owner: string
        name: string
        countLifespanAsStillOngoing?: boolean
      }
      npm?: {
        package: string
      }
    }
  }
  /**
   * A "source directive" can be used instead of an actual field value
   * to indicate that the value should be sourced from an external source.
   * This applies only to fields that can have another source than "self".
   */
  export interface Instruction {
    name?: Name | "_github" | "_npm"
    description?: Description | "_github" | "_npm"
    lifespan?: Lifespan<string> | "_github"
    latestRelease?: Release<string> | "_github" | "_npm"
    links?: Link[]
    pageContents?: PageContents | "_github" | "_npm"
    downloads?: Download[]
    _sources?: Instruction.Sources
  }

  export namespace Firestore {
    export type ServerClientLibrary = Omit<Full<firestore.FieldValue>, "id">
  }

  export namespace MetaData {
    /** More sources may be added in the future. */
    export interface Sources<D = Date> {
      readonly self: {
        /** When this changes, `._modifiedAt` must change too to the same value as this. */
        modifiedAt: D
      }
      github?: {
        owner: string
        name: string
        countLifespanAsStillOngoing?: boolean
        /** When this changes, `._modifiedAt` must change too to the same value as this. */
        refreshedAt: D
      }
      npm?: {
        package: string
        /** When this changes, `._modifiedAt` must change too to the same value as this. */
        refreshedAt: D
      }
    }
    /**
     * Every defined field must have a counterpart within the `SourceMap`.
     * If the "actual" field is undefined, then there may not be a field for it
     * in the `SourceMap`.
     */
    export interface SourceMap {
      /**
       * You can specify the name yourself or it can be crawled from GitHub or from NPM.
       */
      name: "self" | "github" | "npm"
      /**
       * You can write the description yourself or it can be crawled from GitHub or from NPM.
       */
      description: "self" | "github" | "npm"
      /**
       * You can specify the lifespan of your project yourself or it can be crawled from GitHub.
       * It cannot be crawled from NPM, since the dates when package versions were published usually
       * do not represent the actual start and end dates for a project well enough.
       */
      lifespan: "self" | "github"
      /**
       * You can specify the latest release yourself or it can be crawled from GitHub or from NPM.
       */
      latestRelease?: "self" | "github" | "npm"
      /**
       * Links cannot be "outsourced". You must specify links manually.
       */
      links?: "self"
      /**
       * You can add page contents yourself or it can be crawled from GitHub or from NPM.
       */
      pageContents?: "self" | "github" | "npm"
      /**
       * Downloads cannot be "outsourced". You must specify downloads manually.
       */
      downloads?: "self"
    }
  }
  export interface MetaData<D = Date> {
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
  export interface Lifespan<D = Date> {
    begun: D
    ended?: D
  }
  export interface Release<D = Date> {
    version: string
    timestamp: D
  }
  export interface Link {
    /** More link types may be added in the future. */
    type: "github" | "npm"
    url: string
  }
  export type PageContents = string
  export interface Download {
    /** More download types may be added in the future. */
    type: "binary"
    /** More platforms may be added in the future. */
    platform: "windows" | "macos"
    url: string
  }

  export interface Core<D = Date> {
    readonly id: Id
    name: Name
    description: Description
    lifespan: Lifespan<D>
    latestRelease?: Release<D>
    links?: Link[]
    pageContents?: PageContents
    downloads?: Download[]
  }
  export type Full<D = Date> = Core<D> & MetaData<D>
}

// TODO: deprecate the old project interface definition

export interface Release {
  version: string
  date: string
}

export interface ProjectURL {
  type: "GitHub" | "NPM"
  url: string
}

export interface OldProject {
  id: string
  name: string
  slug: string
  releases: Release[]
  firstReleaseDate: string[]
  latestReleaseDate: string[]
  urls: ProjectURL[]
}

export interface OldProjectAsProp {
  project: OldProject
}

export interface OldProjectsAsProp {
  projects: OldProject[]
}

export default Project
