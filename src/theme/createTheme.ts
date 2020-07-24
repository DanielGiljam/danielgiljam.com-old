import {
  Theme,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"

import {breakpoint, maxHeight} from "./constants"

const createTheme = (): Theme => {
  const theme = responsiveFontSizes(createMuiTheme({palette: {type: "dark"}}))
  theme.overrides = {
    MuiCssBaseline: {
      "@global": {
        "html, body": {
          height: "100%",
          width: "100%",
          maxHeight: "100%",
        },
        body: {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
        "#__next": {
          display: "inherit",
          flexDirection: "inherit",
          height: "inherit",
          width: "inherit",
          maxHeight: "inherit",
          [theme.breakpoints.up(breakpoint)]: {
            height: "unset",
            width: theme.breakpoints.values[breakpoint],
            [`@media (min-height: ${maxHeight(theme)}px)`]: {
              height: maxHeight(theme),
            },
          },
        },
        "#__wrapper": {
          overflow: "auto",
          [`@media (min-height: ${theme.breakpoints.values[breakpoint]}px)`]: {
            display: "contents",
          },
          [theme.breakpoints.up(breakpoint)]: {
            borderRadius: theme.shape.borderRadius,
          },
        },
        main: {
          flexGrow: 1,
          overflow: "auto",
          [theme.breakpoints.up(breakpoint)]: {
            borderRadius: theme.shape.borderRadius,
            flexGrow: "unset",
          },
        },
      },
    },
  }
  return theme
}

export default createTheme
