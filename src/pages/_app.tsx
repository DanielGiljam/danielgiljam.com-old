import CssBaseline from "@material-ui/core/CssBaseline"
import Paper from "@material-ui/core/Paper"
import {ThemeProvider} from "@material-ui/core/styles"
import {AppProps} from "next/app"
import Head from "next/head"
import {useEffect} from "react"

import Footer from "../components/Footer"
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
        <div id={"__wrapper"}>
          <Paper component={"main"} square>
            <Component {...pageProps} />
          </Paper>
          <Footer />
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
