import Typography from "@material-ui/core/Typography"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import {GetStaticPaths, GetStaticProps} from "next"
import Head from "next/head"

import Project from "../../types/data/Project"
import initializeAdminSDK from "../firebase/firestore/admin/initialize"
import projectsConverter from "../firebase/firestore/converters/projects"

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
    .withConverter(
      projectsConverter<Project.Core<string>>({
        projectType: "core",
        dateType: "string",
      }),
    )
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
    h1: {
      marginBlockEnd: `${theme.spacing(0.5)}px`,
      marginInlineStart: `${theme.spacing(1)}px`,
      marginInlineEnd: `${theme.spacing(1)}px`,
      paddingBlockStart: `${theme.spacing(1)}px`,
    },
  }),
)

const ProjectPage = ({project}: ProjectPageProps): JSX.Element => {
  const styles = useStyles()
  return (
    <div>
      <Head>
        <title key={"title"}>{`${project.name} | Daniel Giljam`}</title>
        <style
          key={"jss-server-side-2"}
          dangerouslySetInnerHTML={{
            __html:
              (project.pageContents as Exclude<Project.PageContents, string>)
                ?.css ?? "",
          }}
          id={"jss-server-side-2"}
        />
      </Head>
      <Typography className={styles.h1} component={"h1"} variant={"h2"}>
        {project.name}
      </Typography>
      <div
        dangerouslySetInnerHTML={{
          __html:
            (project.pageContents as Exclude<Project.PageContents, string>)
              ?.html ?? "",
        }}
        id={"__mdx"}
      />
    </div>
  )
}

export default ProjectPage
