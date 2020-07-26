import Paper, {PaperProps} from "@material-ui/core/Paper"
import {createStyles, makeStyles} from "@material-ui/core/styles"
import clsx from "clsx"
import {forwardRef} from "react"

import {breakpoint} from "../theme/constants"

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      flexGrow: 1,
      transition: theme.transitions.create("height"),
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

const Main = forwardRef<HTMLElement, PaperProps>(
  ({className, ...props}, ref) => {
    const styles = useStyles()
    return (
      <Paper
        ref={ref}
        className={clsx(className, styles.main)}
        component={"main"}
        square
        {...props}
      />
    )
  },
)

export default Main
