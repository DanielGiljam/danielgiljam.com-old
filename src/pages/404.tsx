import Typography from "@material-ui/core/Typography"
import {createStyles, makeStyles} from "@material-ui/core/styles"

import Main from "../components/Main"
import {defaultSpacing} from "../theme/constants"

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      padding: `${defaultSpacing(theme) * 2}px ${defaultSpacing(theme)}px`,
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
    },
    h1: {
      borderInlineEnd: `thin solid ${theme.palette.divider}`,
      fontWeight: 100,
      lineHeight: 0.833, // 1 - (1.167 - 1), "1.167" is the default line height for h1's in MUI
      marginInlineEnd: defaultSpacing(theme).toString() + "px",
      paddingInlineEnd: defaultSpacing(theme).toString() + "px",
    },
  }),
)

const NotFound = (): JSX.Element => {
  const styles = useStyles()
  return (
    <Main className={styles.main}>
      <Typography className={styles.h1} variant={"h1"}>
        404
      </Typography>
      <Typography variant={"body1"}>Not Found.</Typography>
    </Main>
  )
}

export default NotFound
