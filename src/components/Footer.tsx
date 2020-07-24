import IconButton from "@material-ui/core/IconButton"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import InfoIcon from "@material-ui/icons/InfoOutlined"

import {defaultSpacing} from "../theme/constants"

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    infoButton: {
      margin: defaultSpacing(theme) - 3, // "3" comes from the padding of IconButton when size is "small"
    },
  }),
)

const Footer = (): JSX.Element => {
  const styles = useStyles()
  return (
    <footer className={styles.footer}>
      <IconButton
        aria-label={"info"}
        className={styles.infoButton}
        size={"small"}>
        <InfoIcon />
      </IconButton>
    </footer>
  )
}

export default Footer
