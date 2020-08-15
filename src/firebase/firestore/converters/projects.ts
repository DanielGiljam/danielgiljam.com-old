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

type ProjectTypeName<P extends Project.Flex> = P extends Project.Flex.Core
  ? "core"
  : P extends Project.Flex.Full
  ? "full"
  : never

type DateTypeName<D> = D extends string
  ? "string"
  : D extends Date
  ? "date"
  : D extends Moment
  ? "moment"
  : never

interface ProjectsConverterOptions<P extends Project.Flex> {
  projectType: ProjectTypeName<P>
  dateType: DateTypeName<Project.DateTypeOf<P>>
}

type DateType = string | Moment | Date

const theme = createTheme()
const prefixer = postcss([autoprefixer])
const cleanCSS = new CleanCSS()

const dateConverters = {
  fromFirestore: {
    string(timestamp: Timestamp, format?: string): string {
      return format != null
        ? this.moment(timestamp).format(format)
        : this.moment(timestamp).toISOString()
    },
    date(timestamp: Timestamp): Date {
      return timestamp.toDate()
    },
    moment(timestamp: Timestamp): Moment {
      return moment(this.date(timestamp))
    },
  },
  toFirestore: {
    string(timestamp: string, format?: string): Timestamp {
      return this.moment(moment.utc(timestamp, format ?? moment.ISO_8601))
    },
    date(timestamp: Date): Timestamp {
      return Timestamp.fromDate(timestamp)
    },
    moment(timestamp: Moment): Timestamp {
      return this.date(timestamp.toDate())
    },
  },
}

const lifespanFromFirestore = <D extends DateType>(
  lifespan: Project.Lifespan<Timestamp>,
  dateType: DateTypeName<D>,
): Project.Lifespan<D> => {
  const lifespanConverted: Project.Lifespan<D> = {
    begun: dateConverters.fromFirestore[dateType](
      lifespan.begun,
      "MMM YYYY",
    ) as D,
  }
  if (lifespan.ended != null) {
    lifespanConverted.ended = dateConverters.fromFirestore[dateType](
      lifespan.ended,
      "MMM YYYY",
    ) as D
  }
  return lifespanConverted
}

const latestReleaseFromFirestore = <D extends DateType>(
  {timestamp, ...latestRelease}: Project.Release<Timestamp>,
  dateType: DateTypeName<D>,
): Project.Release<D> => ({
  timestamp: dateConverters.fromFirestore[dateType](timestamp) as D,
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

const sourcesFromFirestore = <D extends DateType>(
  sources: Project.MetaData.Sources<Timestamp>,
  dateType: DateTypeName<D>,
): Project.MetaData.Sources<D> => {
  const sourcesConverted: Project.MetaData.Sources<D> = {
    self: {
      modifiedAt: dateConverters.fromFirestore[dateType](
        sources.self.modifiedAt,
      ) as D,
    },
  }
  if (sources.github != null) {
    const {refreshedAt, ...github} = sources.github
    sourcesConverted.github = {
      refreshedAt: dateConverters.fromFirestore[dateType](refreshedAt) as D,
      ...github,
    }
  }
  if (sources.npm != null) {
    const {refreshedAt, ...npm} = sources.npm
    sourcesConverted.npm = {
      refreshedAt: dateConverters.fromFirestore[dateType](refreshedAt) as D,
      ...npm,
    }
  }
  return sourcesConverted
}

const metaDataFromFirestore = <D extends DateType>(
  snapshot: QueryDocumentSnapshot,
  dateType: DateTypeName<D>,
): Project.MetaData<D> => ({
  _createdAt: moment(snapshot.get("_createdAt").toDate()).toISOString() as D,
  _modifiedAt: moment(snapshot.get("_modifiedAt").toDate()).toISOString() as D,
  _sources: sourcesFromFirestore(snapshot.get("_sources"), dateType),
  _sourceMap: snapshot.get("_sourceMap"),
})

const projectsConverterCore = <D extends DateType>(
  dateType: DateTypeName<D>,
): FirestoreDataConverter<Project.Core<D>> => ({
  // TODO: implement toFirestore() in projectsConverterCore
  toFirestore() {
    return {}
  },
  fromFirestore(snapshot) {
    const project: Project.Core<D> = {
      id: snapshot.id,
      name: snapshot.get("name"),
      description: snapshot.get("description"),
      lifespan: lifespanFromFirestore(snapshot.get("lifespan"), dateType),
    }
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

const projectsConverterFull = <D extends DateType>(
  dateType: DateTypeName<D>,
): FirestoreDataConverter<Project.Full<D>> => ({
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
  if (options.projectType === "core") {
    return projectsConverterCore(options.dateType) as FirestoreDataConverter<P>
  } else {
    return projectsConverterFull(options.dateType) as FirestoreDataConverter<P>
  }
}

export default projectsConverter
