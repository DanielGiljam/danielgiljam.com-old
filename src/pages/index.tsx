import {promises as fs} from "fs"
import path from "path"

import Paper from "@material-ui/core/Paper"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import {GetStaticProps} from "next"

import Footer from "../components/Footer"
import ProjectList from "../components/ProjectList"
import {breakpoint} from "../theme/constants"
import {ProjectsAsProp} from "../types/data/Project"

export const getStaticProps: GetStaticProps<ProjectsAsProp> = async () => ({
  props: {
    projects: JSON.parse(
      await fs.readFile(path.resolve("test/mock-data/projects.json"), "utf-8"),
    ).projects,
  },
})

const useStyles = makeStyles((theme) =>
  createStyles({
    div: {
      overflow: "auto",
      [`@media (min-height: ${theme.breakpoints.values[breakpoint]}px)`]: {
        display: "contents",
      },
      [theme.breakpoints.up(breakpoint)]: {
        borderRadius: theme.shape.borderRadius,
      },
    },
    paper: {
      flexGrow: 1,
      overflow: "auto",
      [theme.breakpoints.up(breakpoint)]: {
        borderRadius: theme.shape.borderRadius,
        flexGrow: "unset",
      },
    },
  }),
)

const Index = ({projects}: ProjectsAsProp): JSX.Element => {
  const styles = useStyles()
  return (
    <div className={styles.div}>
      <Paper className={styles.paper} component={"main"} square>
        <ProjectList projects={projects} />
      </Paper>
      <Footer />
    </div>
  )
}

export default Index
