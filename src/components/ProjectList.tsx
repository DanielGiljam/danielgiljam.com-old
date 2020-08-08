import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Link from "next/link"

interface ProjectListItemProps {
  id: string
  name: string
  description: string
}

export interface ProjectListProps {
  projects: ProjectListItemProps[]
}

const Item = ({id, name, description}: ProjectListItemProps): JSX.Element => (
  <li>
    <Link as={"/" + id} href={"/[project]"} passHref>
      <ListItem component={"a"} button>
        <ListItemText primary={name} secondary={description} />
      </ListItem>
    </Link>
  </li>
)

const ProjectList = ({projects}: ProjectListProps): JSX.Element => (
  <List>
    {projects.map((project) => (
      <Item key={project.id} {...project} />
    ))}
  </List>
)

export default ProjectList
