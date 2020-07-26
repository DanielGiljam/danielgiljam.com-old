import {promises as fs} from "fs"
import path from "path"

import Typography from "@material-ui/core/Typography"
import {GetStaticPaths, GetStaticProps} from "next"

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

const ProjectPage = ({project}: ProjectAsProp): JSX.Element => (
  <Typography align={"center"}>{project.name}</Typography>
)

export default ProjectPage
