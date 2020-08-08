import Divider from "@material-ui/core/Divider"
import Link from "@material-ui/core/Link"
import Typography from "@material-ui/core/Typography"
import {Components} from "@mdx-js/react"

const components: Components = {
  a: ({children, ...props}) => {
    return (
      <Link color={"textPrimary"} underline={"always"} {...props}>
        {children}
      </Link>
    )
  },
  // TODO: add "blockquote", "code", "delete", "em"
  h1: ({children, ...props}) => {
    console.log("h1 props:", props)
    return <Typography variant={"h1"}>{children}</Typography>
  },
  h2: ({children, ...props}) => {
    console.log("h2 props:", props)
    return <Typography variant={"h2"}>{children}</Typography>
  },
  h3: ({children, ...props}) => {
    console.log("h3 props:", props)
    return <Typography variant={"h3"}>{children}</Typography>
  },
  h4: ({children, ...props}) => {
    console.log("h4 props:", props)
    return <Typography variant={"h4"}>{children}</Typography>
  },
  h5: ({children, ...props}) => {
    console.log("h5 props:", props)
    return <Typography variant={"h5"}>{children}</Typography>
  },
  h6: ({children, ...props}) => {
    console.log("h6 props:", props)
    return <Typography variant={"h6"}>{children}</Typography>
  },
  hr: (props) => {
    console.log("hr props:", props)
    return <Divider />
  },
  // TODO: add "img", "inlineCode", "li", "ol"
  p: ({children, ...props}) => {
    console.log("p props:", props)
    return <Typography>{children}</Typography>
  },
  // TODO: add "pre", "strong", "sup", "table", "td", "thematicBreak", "tr", "ul"
}

export default components
