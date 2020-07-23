import CssBaseline from "@material-ui/core/CssBaseline"
import {
  ThemeProvider,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"
import {AppProps} from "next/app"
import {useEffect} from "react"

import createTheme from "../theme/createTheme"

const App = ({Component, pageProps}: AppProps): JSX.Element => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])
  return (
    <ThemeProvider
      theme={createTheme(
        responsiveFontSizes(createMuiTheme({palette: {type: "dark"}})),
      )}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
