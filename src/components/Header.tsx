import MuiLink from "@material-ui/core/Link"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import NextLink from "next/link"

// @ts-expect-error webpack + svg-inline-loader takes care of importing the SVG file
import danielgiljam from "../../assets/danielgiljam.svg"

const useStyles = makeStyles((theme) =>
  createStyles({
    link: {
      display: "block",
      "& > span": {
        display: "block",
        "& > svg": {
          margin: theme.spacing(1),
          fill: theme.palette.text.primary,
        },
      },
    },
    linkFocusVisible: {
      "& > span > svg": {
        backgroundColor: theme.palette.action.selected,
      },
      outline: "unset",
    },
  }),
)

const Header = (): JSX.Element => {
  const styles = useStyles()
  return (
    <header>
      <NextLink as={"/"} href={"/"} passHref>
        <MuiLink
          classes={{focusVisible: styles.linkFocusVisible}}
          className={styles.link}>
          <span dangerouslySetInnerHTML={{__html: danielgiljam}} />
        </MuiLink>
      </NextLink>
    </header>
  )
}

export default Header
