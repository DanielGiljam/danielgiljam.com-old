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

type ProjectTypeName<P extends Project.Flex> = P extends Project.Flex.Full
  ? "full"
  : "core"

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
  toFirestore: {
    string(timestamp: DateType, format?: string): Timestamp {
      return this.moment(
        moment.utc(timestamp as string, format ?? moment.ISO_8601),
      )
    },
    date(timestamp: DateType): Timestamp {
      return Timestamp.fromDate(timestamp as Date)
    },
    moment(timestamp: DateType): Timestamp {
      return this.date((timestamp as Moment).toDate())
    },
  },
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
}

const lifespanToFirestore = <D extends DateType>(
  lifespan: Project.Lifespan<D>,
  dateType: DateTypeName<D>,
): Project.Lifespan<Timestamp> => {
  const lifespanConverted: Project.Lifespan<Timestamp> = {
    begun: dateConverters.toFirestore[dateType](lifespan.begun, "MMM YYYY"),
  }
  if (lifespan.ended != null) {
    lifespanConverted.ended = dateConverters.toFirestore[dateType](
      lifespan.ended,
      "MMM YYYY",
    )
  }
  return lifespanConverted
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

const latestReleaseToFirestore = <D extends DateType>(
  {timestamp, ...latestRelease}: Project.Release<D>,
  dateType: DateTypeName<D>,
): Project.Release<Timestamp> => ({
  timestamp: dateConverters.toFirestore[dateType](timestamp),
  ...latestRelease,
})

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

const sourcesToFirestore = <D extends DateType>(
  sources: Project.MetaData.Sources<D>,
  dateType: DateTypeName<D>,
): Partial<Project.MetaData.Sources<Timestamp>> => {
  const sourcesConverted: Partial<Project.MetaData.Sources<Timestamp>> = {
    self: {
      modifiedAt: dateConverters.toFirestore[dateType](sources.self.modifiedAt),
    },
  }
  if (sources.github != null) {
    const {refreshedAt, ...github} = sources.github
    sourcesConverted.github = {
      refreshedAt: dateConverters.toFirestore[dateType](refreshedAt),
      ...github,
    }
  }
  if (sources.npm != null) {
    const {refreshedAt, ...npm} = sources.npm
    sourcesConverted.npm = {
      refreshedAt: dateConverters.toFirestore[dateType](refreshedAt),
      ...npm,
    }
  }
  return sourcesConverted
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

const metaDataToFirestore = <D extends DateType>(
  modelObject: Partial<Project.Full<D>>,
  dateType: DateTypeName<D>,
): Partial<Project.MetaData<Timestamp>> => {
  const project: Partial<Project.MetaData<Timestamp>> = {}
  if (modelObject._createdAt != null) {
    // @ts-expect-error
    project._createdAt = dateConverters.toFirestore[dateType](
      modelObject._createdAt,
    )
  }
  if (modelObject._modifiedAt != null) {
    project._modifiedAt = dateConverters.toFirestore[dateType](
      modelObject._modifiedAt,
    )
  }
  if (modelObject._sources != null) {
    // @ts-expect-error
    project._sources = sourcesToFirestore(modelObject._sources, dateType)
  }
  if (modelObject._sourceMap != null) {
    // @ts-expect-error
    project._sourceMap = modelObject._sourceMap
  }
  return project
}

const metaDataFromFirestore = <D extends DateType>(
  snapshot: QueryDocumentSnapshot,
  dateType: DateTypeName<D>,
): Project.MetaData<D> => ({
  _createdAt: dateConverters.fromFirestore[dateType](
    snapshot.get("_createdAt"),
  ) as D,
  _modifiedAt: dateConverters.fromFirestore[dateType](
    snapshot.get("_modifiedAt"),
  ) as D,
  _sources: sourcesFromFirestore(snapshot.get("_sources"), dateType),
  _sourceMap: snapshot.get("_sourceMap"),
})

const projectsConverterCore = <D extends DateType>(
  dateType: DateTypeName<D>,
): FirestoreDataConverter<Project.Core<D>> => ({
  toFirestore(modelObject: Partial<Project.Core<D>>) {
    const project: Partial<Project.Core<Timestamp>> = {}
    if (modelObject.name != null) {
      project.name = modelObject.name
    }
    if (modelObject.description != null) {
      project.description = modelObject.description
    }
    if (modelObject.lifespan != null) {
      project.lifespan = lifespanToFirestore(modelObject.lifespan, dateType)
    }
    if (modelObject.latestRelease != null) {
      project.latestRelease = latestReleaseToFirestore(
        modelObject.latestRelease,
        dateType,
      )
    }
    if (modelObject.links != null) {
      project.links = modelObject.links
    }
    if (modelObject.pageContents != null) {
      project.pageContents = modelObject.pageContents
    }
    if (modelObject.downloads != null) {
      project.downloads = modelObject.downloads
    }
    return project
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
  toFirestore(modelObject: Partial<Project.Full<D>>) {
    return {
      ...projectsConverterCore(dateType).toFirestore(modelObject, {}),
      ...metaDataToFirestore(modelObject, dateType),
    }
  },
  fromFirestore(snapshot) {
    return {
      ...projectsConverterCore(dateType).fromFirestore(snapshot),
      ...metaDataFromFirestore(snapshot, dateType),
    }
  },
})

const projectsConverter = <P extends Project.Flex>(
  options: ProjectsConverterOptions<P>,
): FirestoreDataConverter<P> => {
  if (options.projectType === "core") {
    return projectsConverterCore(options.dateType) as FirestoreDataConverter<P>
  } else {
    return projectsConverterFull(options.dateType) as FirestoreDataConverter<P>
  }
}

export default projectsConverter
