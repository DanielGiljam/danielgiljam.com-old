import {
  Theme,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"
import color from "color"

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
          justifyContent: "inherit",
          [theme.breakpoints.up(breakpoint)]: {
            width: theme.breakpoints.values[breakpoint],
            [`@media (min-height: ${maxHeight(theme)}px)`]: {
              maxHeight: maxHeight(theme),
            },
          },
        },
        "#__wrapper": {
          display: "inherit",
          flexDirection: "inherit",
          flexGrow: 1,
          overflow: "auto",
          [`@media (min-height: ${theme.breakpoints.values[breakpoint]}px)`]: {
            display: "contents",
          },
          [theme.breakpoints.up(breakpoint)]: {
            borderRadius: theme.shape.borderRadius,
            flexGrow: "unset",
          },
        },
        code: {
          fontFamily: "Menlo, Monaco, 'Courier New', monospace",
          "&:not(.prism-code)": {
            display: "inline-block",
            backgroundColor: color(theme.palette.info.dark)
              .fade(0.75)
              .toString(),
            borderRadius: theme.shape.borderRadius,
            fontSize: "0.875em",
            paddingLeft: "0.25ch",
            paddingRight: "0.25ch",
          },
        },
        pre: {
          fontSize: "1rem",
        },
        ".prism-code": {
          display: "block",
          fontSize: "0.625rem",
          overflow: "scroll",
          "& > span": {
            backgroundColor: "inherit",
            display: "table-row",
            "& > span": {
              backgroundColor: "inherit",
              display: "table-cell",
              "&:first-child:not(:last-child)": {
                color: theme.palette.text.hint,
                left: 0,
                paddingLeft: defaultSpacing(theme),
                paddingRight: defaultSpacing(theme),
                position: "sticky",
                textAlign: "right",
                userSelect: "none",
              },
            },
            "&:last-child": {
              display: "none",
            },
          },
        },
        ".mdx-link": {
          "&:hover": {
            backgroundColor: theme.palette.text.primary,
            color: theme.palette.getContrastText(theme.palette.text.primary),
          },
        },
      },
    },
  }
  return theme
}

export default createTheme
