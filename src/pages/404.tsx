import Typography from "@material-ui/core/Typography"
import {createStyles, makeStyles} from "@material-ui/core/styles"

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`,
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
    },
    main: {
      padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`,
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
    },
    h1: {
      borderInlineEnd: `thin solid ${theme.palette.divider}`,
      fontWeight: 100,
      lineHeight: 0.833, // 1 - (1.167 - 1), "1.167" is the default line height for h1's in MUI
      marginInlineEnd: `${theme.spacing(1)}px`,
      paddingInlineEnd: `${theme.spacing(1)}px`,
    },
  }),
)

const NotFound = (): JSX.Element => {
  const styles = useStyles()
  return (
    <div className={styles.container}>
      <Typography className={styles.h1} variant={"h1"}>
        404
      </Typography>
      <Typography variant={"body1"}>Not Found.</Typography>
    </div>
  )
}

export default NotFound
