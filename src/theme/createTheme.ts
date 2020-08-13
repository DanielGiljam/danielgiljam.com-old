import {
  Theme,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"

import {breakpoint, maxHeight} from "./constants"

const createTheme = (): Theme => {
  const theme = responsiveFontSizes(
    createMuiTheme({
      palette: {type: "dark"},
      typography: {
        h2: {fontSize: "4.875rem"},
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
          marginBlockStart: `${theme.spacing(1)}px`,
          marginInlineStart: `${theme.spacing(1)}px`,
          marginInlineEnd: `${theme.spacing(1)}px`,
          paddingBlockEnd: `${theme.spacing(1)}px`,
          "& p + p": {
            marginBlockStart: `${theme.spacing(2)}px`,
          },
          "& h1, & h2, & h3, & h4": {
            marginBlockStart: `${theme.spacing(2)}px`,
            marginBlockEnd: `${theme.spacing(0.5)}px`,
          },
          "& h5, & h6": {
            marginBlockStart: `${theme.spacing(1)}px`,
          },
          "& blockquote, & ul, & ol": {
            marginBlockStart: `${theme.spacing(1)}px`,
            marginBlockEnd: `${theme.spacing(1)}px`,
          },
          "& table": {
            marginBlockEnd: `${theme.spacing(1)}px`,
          },
          "& pre": {
            marginBlockStart: `${theme.spacing(1)}px`,
            marginBlockEnd: `${theme.spacing(1)}px`,
            overflow: "hidden",
            "& > code": {
              display: "block",
              fontSize: "0.625rem",
              overflow: "scroll",
              paddingBlockStart: `${theme.spacing(1)}px`,
              paddingBlockEnd: `${theme.spacing(1)}px`,
              "&.language-bash, &:not(.prism-code)": {
                paddingInlineStart: `${theme.spacing(1)}px`,
                paddingInlineEnd: `${theme.spacing(1)}px`,
              },
              "& > span": {
                backgroundColor: "inherit",
                display: "table-row",
                "& > span": {
                  backgroundColor: "inherit",
                  display: "table-cell",
                  paddingInlineEnd: `${theme.spacing(1)}px`,
                  "&:first-child:not(:last-child)": {
                    color: theme.palette.text.hint,
                    left: 0,
                    paddingInlineStart: `${theme.spacing(1)}px`,
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
          "& code": {
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            "&:not(.prism-code)": {
              fontSize: "0.875em",
            },
          },
          "& hr": {
            marginBlockStart: `${theme.spacing(2)}px`,
            marginBlockEnd: `${theme.spacing(2)}px`,
          },
          "& a": {
            "&:hover": {
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.getContrastText(theme.palette.text.primary),
            },
          },
          "& img": {
            display: "block",
            marginBlockStart: `${theme.spacing(0.5)}px`,
            marginBlockEnd: `${theme.spacing(0.5)}px`,
            width: "100%",
          },
          "& > p > img": {
            marginInlineStart: `-${theme.spacing(1)}px`,
            marginInlineEnd: `-${theme.spacing(1)}px`,
            width: `calc(100% + ${theme.spacing(2)}px)`,
          },
          "& > :last-child": {
            marginBlockEnd: "unset",
          },
        },
      },
    },
  }
  return theme
}

export default createTheme
