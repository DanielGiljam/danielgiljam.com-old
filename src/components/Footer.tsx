import IconButton from "@material-ui/core/IconButton"
import Typography from "@material-ui/core/Typography"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import InfoIcon from "@material-ui/icons/InfoOutlined"

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: "flex",
      justifyContent: "space-between",
    },
    crText: {
      padding: theme.spacing(1.5),
    },
  }),
)

const Footer = (): JSX.Element => {
  const styles = useStyles()
  return (
    <footer className={styles.footer}>
      <IconButton aria-label={"info"}>
        <InfoIcon />
      </IconButton>
      <Typography
        className={styles.crText}
        display={"inline"}
        variant={"body1"}
        noWrap>
        © 2020 Daniel Giljam
      </Typography>
    </footer>
  )
}

export default Footer
