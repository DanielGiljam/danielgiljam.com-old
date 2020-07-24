import CssBaseline from "@material-ui/core/CssBaseline"
import {ThemeProvider} from "@material-ui/core/styles"
import {AppProps} from "next/app"
import Head from "next/head"
import {useEffect} from "react"

import Header from "../components/Header"
import createTheme from "../theme/createTheme"

import "../theme/font-faces.css"

const App = ({Component, pageProps}: AppProps): JSX.Element => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])
  return (
    <>
      <Head>
        <title key={"title"}>Daniel Giljam</title>
      </Head>
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <Header />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default App
