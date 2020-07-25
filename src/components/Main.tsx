import Paper, {PaperProps} from "@material-ui/core/Paper"
import {Theme, createStyles, makeStyles} from "@material-ui/core/styles"

import {breakpoint} from "../theme/constants"

interface MainProps {
  grow?: boolean
}

const useStyles = makeStyles<Theme, MainProps>((theme) =>
  createStyles({
    main: {
      flexGrow: 1,
      [`@media (min-height: ${theme.breakpoints.values[breakpoint]}px)`]: {
        overflow: "auto",
      },
      [theme.breakpoints.up(breakpoint)]: {
        borderRadius: theme.shape.borderRadius,
        flexGrow: ({grow}) => (grow === true ? 1 : 0),
      },
    },
  }),
)

const Main = ({grow, ...props}: MainProps & PaperProps): JSX.Element => {
  const styles = useStyles({grow})
  return <Paper className={styles.main} component={"main"} square {...props} />
}

export default Main
