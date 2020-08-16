import {GetStaticProps} from "next"

import ProjectList, {ProjectListProps} from "../components/ProjectList"
import initializeAdminSDK from "../firestore/admin/initialize"

const db = initializeAdminSDK().firestore()

export const getStaticProps: GetStaticProps<ProjectListProps> = async () => ({
  props: {
    projects: (await db.collection("projects").get()).docs.map((project) => ({
      id: project.id,
      name: project.get("name"),
      description: project.get("description"),
    })),
  },
})

const Index = ({projects}: ProjectListProps): JSX.Element => (
  <div>
    <ProjectList projects={projects} />
  </div>
)

export default Index
