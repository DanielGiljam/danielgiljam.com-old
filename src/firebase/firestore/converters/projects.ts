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
import moment, {Moment} from "moment"
import postcss from "postcss"
import React from "react"
import {renderToStaticMarkup} from "react-dom/server"
import remarkSlug from "remark-slug"

import Project from "../../../../types/data/Project"
import createTheme from "../../../theme/createTheme"
import deleteStylesheets from "../../../theme/delete-stylesheets"
import components from "../../../theme/mdx-components"

type ProjectTypeName<P> = P extends Project.Flex.Full
  ? "full"
  : P extends Project.Flex.Core
  ? "core"
  : never

type DateTypeName<P> = P extends Project.Flex<string>
  ? "string"
  : P extends Project.Flex<Moment>
  ? "moment"
  : P extends Project.Flex<Date>
  ? "date"
  : never

interface ProjectsConverterOptions<P extends Project.Flex> {
  projectType: ProjectTypeName<P>
  dateType: DateTypeName<P>
}

const theme = createTheme()
const prefixer = postcss([autoprefixer])
const cleanCSS = new CleanCSS()

const dateConverters = {
  fromFirestore: {
    string(timestamp: Timestamp, format?: string): string {
      return format != null
        ? moment(timestamp.toDate()).format(format)
        : moment(timestamp.toDate()).toISOString()
    },
    moment: (timestamp: Timestamp): Moment => moment(timestamp.toDate()),
    date: (timestamp: Timestamp): Date => timestamp.toDate(),
  },
  toFirestore: {
    string(timestamp: string, format?: string): Timestamp {
      return this.moment(moment.utc(timestamp, format ?? moment.ISO_8601))
    },
    moment(timestamp: Moment): Timestamp {
      return Timestamp.fromDate(timestamp.toDate())
    },
  },
}

const lifespanFromFirestore = <P extends Project.Flex.Core>(
  lifespan: Project.Lifespan<Timestamp>,
  dateType: DateTypeName<P>,
): P["lifespan"] => {
  const lifespanConverted: P["lifespan"] = {
    begun: dateConverters.fromFirestore[dateType](lifespan.begun, "MMM YYYY"),
  }
  if (lifespan.ended != null) {
    lifespanConverted.ended = dateConverters.fromFirestore[dateType](
      lifespan.ended,
      "MMM YYYY",
    )
  }
  return lifespanConverted
}

const latestReleaseFromFirestore = <P extends Project.Flex.Core>(
  {timestamp, ...latestRelease}: Project.Release<Timestamp>,
  dateType: DateTypeName<P>,
): P["latestRelease"] => ({
  timestamp: dateConverters.fromFirestore[dateType](timestamp),
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

const sourcesFromFirestore = <P extends Project.MetaData<any>>(
  sources: Project.MetaData.Sources<Timestamp>,
  dateType: DateTypeName<P>,
): P["_sources"] => {
  const sourcesConverted: P["_sources"] = {
    self: {
      modifiedAt: dateConverters.fromFirestore[dateType](
        sources.self.modifiedAt,
      ),
    },
  }
  if (sources.github != null) {
    const {refreshedAt, ...github} = sources.github
    sourcesConverted.github = {
      refreshedAt: dateConverters.fromFirestore[dateType](refreshedAt),
      ...github,
    }
  }
  if (sources.npm != null) {
    const {refreshedAt, ...npm} = sources.npm
    sourcesConverted.npm = {
      refreshedAt: dateConverters.fromFirestore[dateType](refreshedAt),
      ...npm,
    }
  }
  return sourcesConverted
}

const metaDataFromFirestore = <P extends Project.MetaData<any>>(
  snapshot: QueryDocumentSnapshot,
  dateType: DateTypeName<P>,
): P =>
  (({
    _createdAt: moment(snapshot.get("_createdAt").toDate()).toISOString(),
    _modifiedAt: moment(snapshot.get("_modifiedAt").toDate()).toISOString(),
    _sources: sourcesFromFirestore(snapshot.get("_sources"), dateType),
    _sourceMap: snapshot.get("_sourceMap"),
  } as unknown) as P)

const projectsConverterCore = <P extends Project.Flex.Core>(
  dateType: DateTypeName<P>,
): FirestoreDataConverter<P> => ({
  // TODO: implement toFirestore() in projectsConverterCore
  toFirestore() {
    return {}
  },
  fromFirestore(snapshot) {
    const project = ({
      id: snapshot.id,
      name: snapshot.get("name"),
      description: snapshot.get("description"),
      lifespan: lifespanFromFirestore(snapshot.get("lifespan"), dateType),
    } as unknown) as P
    const latestRelease = snapshot.get("latestRelease")
    if (latestRelease != null) {
      project.latestRelease = latestReleaseFromFirestore(
        latestRelease,
        dateType,
      )
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
})

const projectsConverterFull = <P extends Project.Flex.Full>(
  dateType: DateTypeName<P>,
): FirestoreDataConverter<P> => ({
  // TODO: implement toFirestore() in projectsConverterFull
  toFirestore() {
    return {}
  },
  fromFirestore(snapshot) {
    return {
      ...projectsConverterCore(dateType).fromFirestore(snapshot),
      ...metaDataFromFirestore(snapshot, dateType),
    }
  },
})

const projectsConverter = <P extends Project.Flex = Project.Flex>(
  options: ProjectsConverterOptions<P>,
): FirestoreDataConverter<P> => {
  switch (options.projectType) {
    case "core":
      return projectsConverterCore(options.dateType)
    case "full":
      return projectsConverterFull(options.dateType)
  }
  throw new Error("Failed to get projectsConverter. Options were invalid.")
}

export default projectsConverter
