import {promises as fs} from "fs"
import path from "path"

import {Typography} from "@material-ui/core"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import {GetStaticPaths, GetStaticProps} from "next"

import Main from "../components/Main"
import {defaultSpacing} from "../theme/constants"
import Project, {ProjectAsProp} from "../types/data/Project"

const getProjects = async (): Promise<Project[]> =>
  JSON.parse(
    await fs.readFile(path.resolve("test/mock-data/projects.json"), "utf-8"),
  ).projects

export const getStaticProps: GetStaticProps<
  ProjectAsProp,
  {project?: string}
> = async (context) => {
  const slug = context.params?.project ?? ""
  const project = (await getProjects()).find((project) => project.slug === slug)
  if (project == null)
    throw new Error(
      `Cannot get static props for project page "/${slug}". Project "${slug}" does not exist.`,
    )
  return {props: {project}}
}

export const getStaticPaths: GetStaticPaths = async (...args) => ({
  paths: (await getProjects()).map((project) => "/" + project.slug),
  fallback: false,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      padding: `${defaultSpacing(theme) * 2}px ${defaultSpacing(theme)}px`,
    },
  }),
)

const ProjectPage = ({project}: ProjectAsProp): JSX.Element => {
  const styles = useStyles()
  return (
    <Main className={styles.main}>
      <Typography align={"center"}>{project.name}</Typography>
    </Main>
  )
}

export default ProjectPage
