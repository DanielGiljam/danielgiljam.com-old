import {promises as fs} from "fs"
import {resolve} from "path"

import {transform} from "@babel/core"
import Typography from "@material-ui/core/Typography"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import mdx from "@mdx-js/mdx"
import {MDXProvider, mdx as createElement} from "@mdx-js/react"
import {GetStaticProps} from "next"
import React from "react"
import {renderToStaticMarkup} from "react-dom/server"

import {defaultSpacing} from "../theme/constants"
import components from "../theme/mdx-components"

interface MDXTestPageProps {
  mdxTest: string
}

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
  const elementWithProvider = React.createElement(
    MDXProvider,
    {components},
    element,
  )
  const mdxTest = renderToStaticMarkup(elementWithProvider)
  return {props: {mdxTest}}
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      padding: `${defaultSpacing(theme) * 2}px ${defaultSpacing(theme)}px`,
    },
  }),
)

const MDXTestPage = ({mdxTest}: MDXTestPageProps): JSX.Element => {
  const styles = useStyles()
  return (
    <div className={styles.container}>
      <Typography variant={"h1"}>MDX Test</Typography>
      <div dangerouslySetInnerHTML={{__html: mdxTest}} />
    </div>
  )
}

export default MDXTestPage
