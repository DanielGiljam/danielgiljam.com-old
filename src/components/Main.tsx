import Paper, {PaperProps} from "@material-ui/core/Paper"
import {createStyles, makeStyles} from "@material-ui/core/styles"

import {breakpoint} from "../theme/constants"

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      flexGrow: 1,
      [`@media (min-height: ${theme.breakpoints.values[breakpoint]}px)`]: {
        overflow: "auto",
      },
      [theme.breakpoints.up(breakpoint)]: {
        borderRadius: theme.shape.borderRadius,
        flexGrow: "unset",
      },
    },
  }),
)

const Main = (props: PaperProps): JSX.Element => {
  const styles = useStyles()
  return <Paper className={styles.main} component={"main"} square {...props} />
}

export default Main
