import {
  Theme,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"

import {breakpoint, defaultSpacing, maxHeight} from "./constants"

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
          "& > header > svg": {
            fill: theme.palette.text.primary,
            margin: defaultSpacing(theme),
          },
          [theme.breakpoints.up(breakpoint)]: {
            height: "unset",
            width: theme.breakpoints.values[breakpoint],
            [`@media (min-height: ${maxHeight(theme)}px)`]: {
              height: maxHeight(theme),
            },
          },
        },
      },
    },
  }
  return theme
}

export default createTheme
