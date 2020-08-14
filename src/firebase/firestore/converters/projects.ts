import {transform} from "@babel/core"
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from "@google-cloud/firestore"
import {
  ServerStyleSheets,
  ThemeProvider,
  ThemeProviderProps,
} from "@material-ui/core/styles"
import {sync} from "@mdx-js/mdx"
import {MDXProvider, mdx as createElement} from "@mdx-js/react"
import autoprefixer from "autoprefixer"
import CleanCSS from "clean-css"
import moment from "moment"
import postcss from "postcss"
import React from "react"
import {renderToStaticMarkup} from "react-dom/server"
import remarkSlug from "remark-slug"

import Project from "../../../../types/data/Project"
import createTheme from "../../../theme/createTheme"
import deleteStylesheets from "../../../theme/delete-stylesheets"
import components from "../../../theme/mdx-components"

const theme = createTheme()
const prefixer = postcss([autoprefixer])
const cleanCSS = new CleanCSS()

const lifespanFromFirestore = (
  lifespan: Project.Lifespan<Timestamp>,
): Project.Lifespan<string> => {
  const lifespanConverted: Project.Lifespan<string> = {
    begun: moment(lifespan.begun.toDate()).format("MMM YYYY"),
  }
  if (lifespan.ended != null) {
    lifespanConverted.ended = moment(lifespan.ended.toDate()).format("MMM YYYY")
  }
  return lifespanConverted
}

const latestReleaseFromFirestore = ({
  timestamp,
  ...latestRelease
}: Project.Release<Timestamp>): Project.Release<string> => ({
  timestamp: moment(timestamp.toDate()).toISOString(),
  ...latestRelease,
})

/** Inspired by the code sample at https://mdxjs.com/getting-started#do-it-yourself */
const pageContentsFromFirestore = (
  pageContents: Project.PageContents,
): Project.PageContents => {
  const jsx = sync(pageContents as string, {
    skipExport: true,
    remarkPlugins: [remarkSlug],
  })
  const code = transform(jsx, {plugins: ["@babel/plugin-transform-react-jsx"]})
    .code
  const scope = {mdx: createElement}
  // eslint-disable-next-line
  const func = new Function(
    "React",
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`,
  )
  const element = func(React, ...Object.values(scope))
  const elementWithProvider1 = React.createElement(
    MDXProvider,
    {components},
    element,
  )
  const elementWithProvider2 = React.createElement(
    ThemeProvider,
    ({theme} as unknown) as ThemeProviderProps,
    elementWithProvider1,
  )
  const sheets = new ServerStyleSheets()
  const html = renderToStaticMarkup(sheets.collect(elementWithProvider2))
  deleteStylesheets(sheets)
  let css = sheets.toString()
  if (css != null && css.length !== 0) {
    const processedCSSPass1 = prefixer.process(css).css
    css = cleanCSS.minify(processedCSSPass1).styles
  }
  return {html, css}
}

const sourcesFromFirestore = (
  sources: Project.MetaData.Sources<Timestamp>,
): Project.MetaData.Sources<string> => {
  const sourcesConverted: Project.MetaData.Sources<string> = {
    self: {
      modifiedAt: moment(sources.self.modifiedAt.toDate()).toISOString(),
    },
  }
  if (sources.github != null) {
    const {refreshedAt, ...github} = sources.github
    sourcesConverted.github = {
      refreshedAt: moment(refreshedAt.toDate()).toISOString(),
      ...github,
    }
  }
  if (sources.npm != null) {
    const {refreshedAt, ...npm} = sources.npm
    sourcesConverted.npm = {
      refreshedAt: moment(refreshedAt.toDate()).toISOString(),
      ...npm,
    }
  }
  return sourcesConverted
}

const metaDataFromFirestore = (
  snapshot: QueryDocumentSnapshot,
): Project.MetaData<string> => ({
  _createdAt: moment(snapshot.get("_createdAt").toDate()).toISOString(),
  _modifiedAt: moment(snapshot.get("_modifiedAt").toDate()).toISOString(),
  _sources: sourcesFromFirestore(snapshot.get("_sources")),
  _sourceMap: snapshot.get("_sourceMap"),
})

export const projectsConverterCore: FirestoreDataConverter<Project.Core<
  string
>> = {
  // TODO: implement toFirestore() in projectsConverterCore
  toFirestore(modelObject: Partial<Project.Core<string>>) {
    return {}
  },
  fromFirestore(snapshot) {
    const project: Project.Core<string> = {
      id: snapshot.id,
      name: snapshot.get("name"),
      description: snapshot.get("description"),
      lifespan: lifespanFromFirestore(snapshot.get("lifespan")),
    }
    const latestRelease = snapshot.get("latestRelease")
    if (latestRelease != null) {
      project.latestRelease = latestReleaseFromFirestore(latestRelease)
    }
    const links = snapshot.get("links")
    if (links != null) {
      project.links = links
    }
    const pageContents = snapshot.get("pageContents")
    if (pageContents != null) {
      project.pageContents = pageContentsFromFirestore(pageContents)
    }
    const downloads = snapshot.get("downloads")
    if (downloads != null) {
      project.downloads = downloads
    }
    return project
  },
}

export const projectsConverterFull: FirestoreDataConverter<Project.Full<
  string
>> = {
  // TODO: implement toFirestore() in projectsConverterFull
  toFirestore(modelObject: Partial<Project.Full<string>>) {
    return {}
  },
  fromFirestore(snapshot) {
    return {
      ...projectsConverterCore.fromFirestore(snapshot),
      ...metaDataFromFirestore(snapshot),
    }
  },
}
