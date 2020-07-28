import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Link from "next/link"

import {
  OldProjectAsProp as ProjectAsProp,
  OldProjectsAsProp as ProjectsAsProp,
} from "../../types/data/Project"

const Item = ({project}: ProjectAsProp): JSX.Element => (
  <li>
    <Link as={"/" + project.slug} href={"/[project]"} passHref>
      <ListItem component={"a"} button>
        <ListItemText primary={project.name} secondary={project.slug} />
      </ListItem>
    </Link>
  </li>
)

const ProjectList = ({projects}: ProjectsAsProp): JSX.Element => (
  <List>
    {projects.map((project) => (
      <Item key={project.id} project={project} />
    ))}
  </List>
)

export default ProjectList
