import Typography from "@material-ui/core/Typography"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import {GetStaticPaths, GetStaticProps} from "next"

import Project from "../../types/data/Project"
import {projectsConverterCore} from "../firebase/firestore/converters/projects"
import initializeAdminSDK from "../firebase/initializeAdminSDK"
import {defaultSpacing} from "../theme/constants"

interface ProjectPageProps {
  project: Project.Core<string>
}

const db = initializeAdminSDK().firestore()

export const getStaticProps: GetStaticProps<
  ProjectPageProps,
  {project?: string}
> = async (context) => {
  const slug = context.params?.project ?? ""
  const project = await db
    .collection("projects")
    .withConverter(projectsConverterCore)
    .doc(slug)
    .get()
  if (!project.exists) {
    throw new Error(
      `Cannot get static props for project page "/${slug}". Project "${slug}" does not exist.`,
    )
  }
  return {
    props: {
      project: project.data() as Project.Core<string>,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await db.collection("projects").listDocuments()).map(
    ({id}) => "/" + id,
  ),
  fallback: false,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      padding: `${defaultSpacing(theme) * 2}px ${defaultSpacing(theme)}px`,
    },
  }),
)

const ProjectPage = ({project}: ProjectPageProps): JSX.Element => {
  const styles = useStyles()
  console.log("project:", project)
  return (
    <div className={styles.container}>
      <Typography align={"center"}>{project.name}</Typography>
    </div>
  )
}

export default ProjectPage
