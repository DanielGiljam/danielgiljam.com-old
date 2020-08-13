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
import Heading from "../components/Heading"

const components: Components = {
  p: ({children}) => <Typography>{children}</Typography>,
  h1: ({children, ...props}) => (
    <Heading variant={"h2"} {...props}>
      {children}
    </Heading>
  ),
  h2: ({children, ...props}) => (
    <Heading variant={"h3"} {...props}>
      {children}
    </Heading>
  ),
  h3: ({children, ...props}) => (
    <Heading variant={"h4"} {...props}>
      {children}
    </Heading>
  ),
  h4: ({children, ...props}) => (
    <Heading variant={"h5"} {...props}>
      {children}
    </Heading>
  ),
  h5: ({children, ...props}) => (
    <Heading variant={"h6"} {...props}>
      {children}
    </Heading>
  ),
  h6: ({children, ...props}) => (
    <Heading variant={"subtitle1"} {...props}>
      {children}
    </Heading>
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
