import CssBaseline from "@material-ui/core/CssBaseline"
import {ThemeProvider, createStyles, makeStyles} from "@material-ui/core/styles"
import clsx from "clsx"
import {AppProps} from "next/app"
import Head from "next/head"
import {useEffect} from "react"

import Footer from "../components/Footer"
import Header from "../components/Header"
import Main from "../components/Main"
import {defaultSpacing} from "../theme/constants"
import createTheme from "../theme/createTheme"

import "../theme/font-faces.css"

const useStyles = makeStyles((theme) =>
  createStyles({
    project: {
      padding: `${defaultSpacing(theme) * 2}px ${defaultSpacing(theme)}px`,
    },
    notFound: {
      padding: `${defaultSpacing(theme) * 2}px ${defaultSpacing(theme)}px`,
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
    },
  }),
)

const App = ({Component, pageProps, router}: AppProps): JSX.Element => {
  const styles = useStyles()
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
          <Main
            className={clsx({
              [styles.project]:
                router.pathname !== "/" && router.pathname !== "/404",
              [styles.notFound]: router.pathname === "/404",
            })}>
            <Component {...pageProps} />
          </Main>
          <Footer />
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
