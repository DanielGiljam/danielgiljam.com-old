import Divider from "@material-ui/core/Divider"
import Link from "@material-ui/core/Link"
import Paper from "@material-ui/core/Paper"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Typography from "@material-ui/core/Typography"
import {Components} from "@mdx-js/react"

import CodeBlock from "../components/CodeBlock"

const components: Components = {
  // TODO: add auto-link headings plugin
  p: ({children}) => <Typography>{children}</Typography>,
  h1: ({children}) => (
    <Typography component={"h1"} variant={"h2"}>
      {children}
    </Typography>
  ),
  h2: ({children}) => (
    <Typography component={"h2"} variant={"h3"}>
      {children}
    </Typography>
  ),
  h3: ({children}) => (
    <Typography component={"h3"} variant={"h4"}>
      {children}
    </Typography>
  ),
  h4: ({children}) => (
    <Typography component={"h4"} variant={"h5"}>
      {children}
    </Typography>
  ),
  h5: ({children}) => (
    <Typography component={"h5"} variant={"h6"}>
      {children}
    </Typography>
  ),
  h6: ({children}) => (
    <Typography component={"h6"} variant={"subtitle1"}>
      {children}
    </Typography>
  ),
  thematicBreak: () => <Divider variant={"middle"} />,
  ul: ({children}) => <Typography component={"ul"}>{children}</Typography>,
  table: ({children}) => (
    <TableContainer>
      <Table>{children}</Table>
    </TableContainer>
  ),
  thead: ({children}) => <TableHead>{children}</TableHead>,
  tbody: ({children}) => <TableBody>{children}</TableBody>,
  tr: ({children}) => <TableRow>{children}</TableRow>,
  td: ({children}) => <TableCell>{children}</TableCell>,
  th: ({children}) => <TableCell>{children}</TableCell>,
  pre: ({children}) => (
    <Paper component={"pre"} elevation={0}>
      {children}
    </Paper>
  ),
  code: ({children, ...props}) => <CodeBlock {...props}>{children}</CodeBlock>,
  hr: () => <Divider variant={"middle"} />,
  a: ({children, ...props}) => (
    <Link color={"textPrimary"} underline={"always"} {...props}>
      {children}
    </Link>
  ),
  img: (props) => <img {...props} />,
  // TODO: add "blockquote"
}

export default components
