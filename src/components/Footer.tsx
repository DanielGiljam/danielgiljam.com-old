import IconButton from "@material-ui/core/IconButton"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import InfoIcon from "@material-ui/icons/InfoOutlined"
import Link from "next/link"

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    infoButton: {
      margin: theme.spacing(1) - 3, // "3" comes from the padding of IconButton when size is "small"
    },
  }),
)

const Footer = (): JSX.Element => {
  const styles = useStyles()
  return (
    <footer className={styles.footer}>
      <Link href={"/about"} passHref>
        <IconButton
          aria-label={"info"}
          className={styles.infoButton}
          component={"a"}
          size={"small"}>
          <InfoIcon />
        </IconButton>
      </Link>
    </footer>
  )
}

export default Footer
