import CssBaseline from "@material-ui/core/CssBaseline"
import {ThemeProvider} from "@material-ui/core/styles"
import {AppProps} from "next/app"
import {useEffect} from "react"

import createTheme from "../theme/createTheme"

import "fontsource-roboto/latin-300-normal.css"
import "fontsource-roboto/latin-400-normal.css"
import "fontsource-roboto/latin-500-normal.css"
import "fontsource-roboto/latin-700-normal.css"

const App = ({Component, pageProps}: AppProps): JSX.Element => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
