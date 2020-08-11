import Divider from "@material-ui/core/Divider"
import Link from "@material-ui/core/Link"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import {Components} from "@mdx-js/react"

import CodeBlock from "../components/CodeBlock"

const components: Components = {
  // TODO: add auto-link headings plugin
  h1: ({children, ...props}) => {
    console.log("h1 props:", props)
    return (
      <Typography component={"h1"} variant={"h2"}>
        {children}
      </Typography>
    )
  },
  h2: ({children, ...props}) => {
    console.log("h2 props:", props)
    return (
      <Typography component={"h2"} variant={"h3"}>
        {children}
      </Typography>
    )
  },
  h3: ({children, ...props}) => {
    console.log("h3 props:", props)
    return (
      <Typography component={"h3"} variant={"h4"}>
        {children}
      </Typography>
    )
  },
  h4: ({children, ...props}) => {
    console.log("h4 props:", props)
    return (
      <Typography component={"h4"} variant={"h5"}>
        {children}
      </Typography>
    )
  },
  h5: ({children, ...props}) => {
    console.log("h5 props:", props)
    return (
      <Typography component={"h5"} variant={"h6"}>
        {children}
      </Typography>
    )
  },
  h6: ({children, ...props}) => {
    console.log("h6 props:", props)
    return (
      <Typography component={"h6"} variant={"subtitle1"}>
        {children}
      </Typography>
    )
  },
  p: ({children, ...props}) => {
    console.log("p children:", children)
    console.log("p props:", props)
    return <Typography>{children}</Typography>
  },
  a: ({children, ...props}) => {
    console.log("a props:", props)
    return (
      <Link
        className={"mdx-link"}
        color={"textPrimary"}
        underline={"always"}
        {...props}>
        {children}
      </Link>
    )
  },
  ul: ({children, ...props}) => {
    console.log("ul props:", props)
    return <Typography component={"ul"}>{children}</Typography>
  },
  hr: (props) => {
    console.log("hr props:", props)
    return <Divider variant={"middle"} />
  },
  thematicBreak: (props) => {
    console.log("thematicBreak props:", props)
    return <Divider variant={"middle"} />
  },
  pre: ({children, ...props}) => {
    console.log("pre props:", props)
    return (
      <Paper component={"pre"} elevation={0} {...props}>
        {children}
      </Paper>
    )
  },
  code: ({children, ...props}) => {
    console.log("code props:", props)
    return <CodeBlock {...props}>{children}</CodeBlock>
  },
  img: (props) => {
    console.log("img props:", props)
    return <img {...props} />
  },
  // TODO: add "table", "td", "tr" and "blockquote"
}

export default components
