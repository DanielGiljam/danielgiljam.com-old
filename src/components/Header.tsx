import MuiLink from "@material-ui/core/Link"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import NextLink from "next/link"

// @ts-expect-error webpack + svg-inline-loader takes care of importing the SVG file
import danielgiljam from "../../assets/danielgiljam.svg"
import {defaultSpacing} from "../theme/constants"

const useStyles = makeStyles((theme) =>
  createStyles({
    link: {
      "&:hover": {
        "& > svg": {
          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 32))",
          transition: theme.transitions.create(["filter", "transform"]),
          transform: "scale(1.03125)",
        },
      },
      "& > svg": {
        fill: theme.palette.text.primary,
        margin: defaultSpacing(theme),
      },
    },
    linkFocusVisible: {
      outline: "unset",
      "& > svg": {
        animation: "$linkFocusVisibleAnimation 1s linear infinite alternate",
      },
    },
    "@keyframes linkFocusVisibleAnimation": {
      from: {
        filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 16))",
        transform: "scale(1.0078125)",
      },
      to: {
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 32))",
        transform: "scale(1.03125)",
      },
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
          className={styles.link}
          dangerouslySetInnerHTML={{__html: danielgiljam}}
        />
      </NextLink>
    </header>
  )
}

export default Header
