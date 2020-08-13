import {
  Theme,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"

import {breakpoint, defaultSpacing, maxHeight} from "./constants"

// TODO: fix the abuse of "defaultSpacing"
// TODO: replace "margin-top", "padding-left", etc. with "margin-block-start", "padding-inline-start", etc.

const createTheme = (): Theme => {
  const theme = responsiveFontSizes(
    createMuiTheme({
      palette: {type: "dark"},
      typography: {
        subtitle1: {fontSize: "1.1875rem"},
        subtitle2: {fontSize: "1.125rem"},
      },
    }),
  )
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
        "#__mdx": {
          marginLeft: defaultSpacing(theme),
          marginRight: defaultSpacing(theme),
          marginTop: defaultSpacing(theme),
          paddingBottom: defaultSpacing(theme),
          "& h1, & h2, & h3, & h4": {
            marginBottom: defaultSpacing(theme) / 2,
            marginTop: defaultSpacing(theme) * 2,
          },
          "& h5, & h6": {
            marginTop: defaultSpacing(theme),
          },
          "& p + p": {
            marginTop: defaultSpacing(theme) / 2,
          },
          "& ol": {
            marginBottom: defaultSpacing(theme),
            marginTop: defaultSpacing(theme),
          },
          "& a": {
            "&:hover": {
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.getContrastText(theme.palette.text.primary),
            },
          },
          "& hr": {
            marginBottom: defaultSpacing(theme) * 3,
            marginTop: defaultSpacing(theme) * 3,
          },
          "& table": {
            marginBottom: defaultSpacing(theme),
          },
          "& img": {
            display: "block",
            marginBottom: defaultSpacing(theme) / 2,
            marginTop: defaultSpacing(theme) / 2,
            width: "100%",
          },
          "& > p > img": {
            marginLeft: -defaultSpacing(theme),
            marginRight: -defaultSpacing(theme),
            width: `calc(100% + ${defaultSpacing(theme) * 2}px)`,
          },
          "& code": {
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            "&:not(.prism-code)": {
              fontSize: "0.875em",
            },
          },
          "& pre": {
            marginBottom: defaultSpacing(theme) / 2,
            marginTop: defaultSpacing(theme) / 2,
            overflow: "hidden",
            "& > code": {
              display: "block",
              fontSize: "0.625rem",
              overflow: "scroll",
              paddingTop: defaultSpacing(theme),
              paddingBottom: defaultSpacing(theme),
              paddingRight: defaultSpacing(theme),
              "&.language-bash, &:not(.prism-code)": {
                paddingLeft: defaultSpacing(theme),
              },
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
          },
          "& > :last-child": {
            marginBottom: "unset",
          },
        },
      },
    },
  }
  return theme
}

export default createTheme
