import {Theme} from "@material-ui/core/styles"

export const breakpoint: keyof Theme["breakpoints"]["values"] = "sm"

export const defaultSpacing = (theme: Theme): number => theme.spacing(1.5)

export const maxHeight = (theme: Theme): number =>
  theme.breakpoints.values[breakpoint] * 1.5
