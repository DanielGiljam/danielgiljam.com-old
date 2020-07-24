import {createStyles, makeStyles} from "@material-ui/core/styles"

// @ts-expect-error webpack + svg-inline-loader takes care of importing the SVG file
import danielgiljam from "../../assets/danielgiljam.svg"
import {defaultSpacing} from "../theme/constants"

const useStyles = makeStyles((theme) =>
  createStyles({
    header: {
      "& > svg": {
        fill: theme.palette.text.primary,
        margin: defaultSpacing(theme),
      },
    },
  }),
)

const Header = (): JSX.Element => {
  const styles = useStyles()
  return (
    <header
      className={styles.header}
      dangerouslySetInnerHTML={{__html: danielgiljam}}
    />
  )
}

export default Header
