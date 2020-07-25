import {promises as fs} from "fs"
import path from "path"

import {GetStaticProps} from "next"

import Main from "../components/Main"
import ProjectList from "../components/ProjectList"
import {ProjectsAsProp} from "../types/data/Project"

export const getStaticProps: GetStaticProps<ProjectsAsProp> = async () => ({
  props: {
    projects: JSON.parse(
      await fs.readFile(path.resolve("test/mock-data/projects.json"), "utf-8"),
    ).projects,
  },
})

const Index = ({projects}: ProjectsAsProp): JSX.Element => (
  <Main>
    <ProjectList projects={projects} />
  </Main>
)

export default Index
