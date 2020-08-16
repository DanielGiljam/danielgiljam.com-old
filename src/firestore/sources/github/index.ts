import {promises as fs} from "fs"
import path from "path"

import chalk from "chalk"
import fetch from "isomorphic-unfetch"
import moment from "moment"

import Source, {Fetcher, Parsers} from "../../Source"
import {
  fixMDXBreakingBrTags,
  latestReleaseVersionRegex,
  nameRegex,
  removeHeading1,
  replaceImageSourcesRelativeWithAbsolute,
} from "../../admin/util"

export type SupportedField =
  | "name"
  | "description"
  | "lifespan"
  | "latestRelease"
  | "pageContents"

export interface Config {
  owner: string
  name: string
  countLifespanAsStillOngoing?: boolean
}

interface Response {
  description?: string
  defaultBranchRef?: {
    target: {
      authoredDate?: string
      history: {
        nodes: Array<{
          authoredDate: string
        }>
        pageInfo: {
          endCursor: string
          hasNextPage: boolean
        }
      }
    }
  }
  releases: {
    nodes: Array<{
      name: string
      tagName: string
      publishedAt: string
      isPrerelease: boolean
    }>
  }
  pageContents?: {
    readme: string
    url: string
  }
}

export type GitHubResponse = Response

class GitHub extends Source<SupportedField, Config, Response> {
  protected static readonly _FANCY_NAME = "GitHub"
  protected static readonly _SUPPORTED_FIELDS_REGEX = /^name|description|lifespan|latestRelease|pageContents$/
  protected static readonly _PARSERS: Parsers<SupportedField, Response> = {
    name(id, {pageContents}) {
      if (pageContents != null) {
        const execResult = nameRegex.exec(pageContents.readme)
        if (execResult != null) {
          return execResult[0]
        }
      }
      return GitHub._THROW_FAILED_ACQUISITION(id, "name")
    },
    description(id, {description}) {
      if (description != null) {
        return description
      }
      return GitHub._THROW_FAILED_ACQUISITION(id, "description")
    },
    lifespan(id, {defaultBranchRef}) {
      if (defaultBranchRef != null) {
        const historyNodes = defaultBranchRef.target.history.nodes
        const begun = moment.utc(
          historyNodes[historyNodes.length - 1].authoredDate,
          moment.ISO_8601,
        )
        const ended =
          defaultBranchRef.target.authoredDate != null
            ? moment.utc(defaultBranchRef.target.authoredDate, moment.ISO_8601)
            : undefined
        return {begun, ended}
      }
      return GitHub._THROW_FAILED_ACQUISITION(id, "lifespan")
    },
    latestRelease(id, {releases}) {
      const {tagName, publishedAt, isPrerelease} = releases.nodes[0] ?? {}
      const execResult = latestReleaseVersionRegex.exec(tagName)
      if (execResult != null) {
        return {
          version: execResult[0],
          timestamp: moment.utc(publishedAt, moment.ISO_8601),
          isPrerelease,
        }
      }
      return GitHub._THROW_FAILED_ACQUISITION(id, "latestRelease")
    },
    pageContents(id, {pageContents}) {
      if (pageContents != null) {
        const readme = pageContents.readme
          .replace(...removeHeading1)
          .replace(...fixMDXBreakingBrTags)
          .replace(...replaceImageSourcesRelativeWithAbsolute(pageContents.url))
        if (readme.length !== 0) {
          return readme
        }
      }
      return GitHub._THROW_FAILED_ACQUISITION(id, "pageContents")
    },
  }

  private static _GRAPHQL_QUERY_1: string
  private static _GRAPHQL_QUERY_2: string

  static readonly DIRECTIVE = "_github"

  protected static readonly _FETCHER: Fetcher<Config, Response> = async (
    id,
    {owner, name, countLifespanAsStillOngoing},
    networkDumpProperty,
  ) => {
    if (GitHub._GRAPHQL_QUERY_1 == null) {
      GitHub._GRAPHQL_QUERY_1 = await fs.readFile(
        path.resolve(__dirname, "./query-1.graphql"),
        "utf-8",
      )
    }
    if (GitHub._GRAPHQL_QUERY_2 == null) {
      GitHub._GRAPHQL_QUERY_2 = await fs.readFile(
        path.resolve(__dirname, "./query-1.graphql"),
        "utf-8",
      )
    }
    const githubResponse: GitHubResponse = await fetch(
      ...GitHub._FETCH_1_ENDPOINT(owner, name),
    ).then(async (res) => {
      const json = await res.json()
      networkDumpProperty.github = json
      if (json?.data?.repository == null) {
        throw new Error(
          `${chalk.red(
            "Unable to decode response from GitHub",
          )} in "${id}._source.github".`,
        )
      }
      return json.data.repository
    })
    const readme = await fetch(...GitHub._FETCH_2_ENDPOINT(owner, name)).then(
      async (res) => await res.text(),
    )
    if (readme != null && readme.length !== 0) {
      githubResponse.pageContents = {
        readme,
        url: `https://raw.githubusercontent.com/${owner}/${name}/master/`,
      }
    }
    if (githubResponse.defaultBranchRef != null) {
      if (countLifespanAsStillOngoing ?? false) {
        githubResponse.defaultBranchRef.target.authoredDate = undefined
      }
      let hasNextPage =
        githubResponse.defaultBranchRef.target.history.pageInfo.hasNextPage
      if (hasNextPage) {
        let cursor =
          githubResponse.defaultBranchRef.target.history.pageInfo.endCursor
        let defaultBranchRef: NonNullable<GitHubResponse["defaultBranchRef"]>
        do {
          defaultBranchRef = (
            await fetch(...GitHub._FETCH_1_ENDPOINT(owner, name, cursor)).then(
              async (res) => await res.json(),
            )
          ).data.repository.defaultBranchRef
          hasNextPage = defaultBranchRef.target.history.pageInfo.hasNextPage
          cursor = defaultBranchRef.target.history.pageInfo.endCursor
        } while (hasNextPage)
        githubResponse.defaultBranchRef.target.history =
          defaultBranchRef.target.history
      }
    }
    return githubResponse
  }

  private static readonly _FETCH_1_ENDPOINT = (
    owner: string,
    name: string,
    cursor?: string,
  ): Parameters<typeof fetch> => {
    return [
      "https://api.github.com/graphql",
      {
        method: "post",
        body: JSON.stringify({
          query:
            cursor == null ? GitHub._GRAPHQL_QUERY_1 : GitHub._GRAPHQL_QUERY_2,
          variables: {
            owner,
            name,
            cursor,
          },
        }),
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN as string}`,
        },
      },
    ]
  }

  private static readonly _FETCH_2_ENDPOINT = (
    owner: string,
    name: string,
  ): Parameters<typeof fetch> => [
    `https://raw.githubusercontent.com/${owner}/${name}/master/README.md`,
  ]
}

export default GitHub
