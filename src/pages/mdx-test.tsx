import {promises as fs} from "fs"
import {resolve} from "path"

import {transform} from "@babel/core"
import Divider from "@material-ui/core/Divider"
import Typography from "@material-ui/core/Typography"
import {
  ServerStyleSheets,
  ThemeProvider,
  ThemeProviderProps,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles"
import mdx from "@mdx-js/mdx"
import {MDXProvider, mdx as createElement} from "@mdx-js/react"
import autoprefixer from "autoprefixer"
import CleanCSS from "clean-css"
import {GetStaticProps} from "next"
import Head from "next/head"
import postcss from "postcss"
import React from "react"
import {renderToStaticMarkup} from "react-dom/server"

import {defaultSpacing} from "../theme/constants"
import createTheme from "../theme/createTheme"
import deleteStylesheets from "../theme/delete-stylesheets"
import components from "../theme/mdx-components"

interface MDXTestPageProps {
  mdxTest: {html: string; css: string}
}

const theme = createTheme()
const prefixer = postcss([autoprefixer])
const cleanCSS = new CleanCSS()

export const getStaticProps: GetStaticProps<MDXTestPageProps> = async (
  context,
) => {
  const jsx = await mdx(
    (
      await fs.readFile(
        resolve(process.cwd(), "env/mdx-with-everything.mdx"),
        "utf-8",
      )
    ).replace(/<br>/g, "<br/>"),
    {
      skipExport: true,
    },
  )
  const code = transform(jsx, {plugins: ["@babel/plugin-transform-react-jsx"]})
    .code
  const scope = {mdx: createElement}
  // eslint-disable-next-line
  const fn = new Function(
    "React",
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`,
  )
  const element = fn(React, ...Object.values(scope))
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
  return {
    props: {
      mdxTest: {
        html,
        css,
      },
    },
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    h1: {
      marginBottom: defaultSpacing(theme) / 2,
      marginLeft: defaultSpacing(theme),
      marginRight: defaultSpacing(theme),
      paddingTop: defaultSpacing(theme),
    },
  }),
)

const MDXTestPage = ({mdxTest}: MDXTestPageProps): JSX.Element => {
  const styles = useStyles()
  return (
    <div>
      <Head>
        <title key={"title"}>MDX Test | Daniel Giljam</title>
        <style
          key={"jss-server-side-2"}
          dangerouslySetInnerHTML={{__html: mdxTest.css}}
          id={"jss-server-side-2"}
        />
      </Head>
      <Typography className={styles.h1} component={"h1"} variant={"h2"}>
        MDX Test
      </Typography>
      <Divider />
      <div dangerouslySetInnerHTML={{__html: mdxTest.html}} id={"__mdx"} />
    </div>
  )
}

export default MDXTestPage
