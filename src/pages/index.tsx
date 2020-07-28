import {promises as fs} from "fs"
import path from "path"

import {GetStaticProps} from "next"

import {OldProjectsAsProp as ProjectsAsProp} from "../../types/data/Project"
import ProjectList from "../components/ProjectList"

export const getStaticProps: GetStaticProps<ProjectsAsProp> = async () => ({
  props: {
    projects: JSON.parse(
      await fs.readFile(path.resolve("env/mock-data/projects.json"), "utf-8"),
    ).projects,
  },
})

const Index = ({projects}: ProjectsAsProp): JSX.Element => (
  <div>
    <ProjectList projects={projects} />
  </div>
)

export default Index
