const stylesheetNames = [
  "MuiButtonBase",
  "MuiIconButton",
  "MuiSvgIcon",
  "MuiTypography",
  "MuiLink",
  "MuiPaper",
  "MuiDivider",
]

const deleteStylesheets = (sheets) => {
  stylesheetNames.forEach((name) => {
    sheets.sheetsRegistry.remove(
      sheets.sheetsRegistry.registry.find(
        (sheet) => sheet.options.name === name,
      ),
    )
  })
}

export default deleteStylesheets
