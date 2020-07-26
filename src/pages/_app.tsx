import CssBaseline from "@material-ui/core/CssBaseline"
import {ThemeProvider} from "@material-ui/core/styles"
import {AppProps} from "next/app"
import Head from "next/head"
import {useEffect, useRef, useState} from "react"

import Footer from "../components/Footer"
import Header from "../components/Header"
import Main from "../components/Main"
import createTheme from "../theme/createTheme"

import "../theme/font-faces.css"

const App = ({Component, pageProps, router}: AppProps): JSX.Element => {
  const [mainHeight, setMainHeight] = useState<number | undefined>()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])
  useEffect(() => {
    setMainHeight((mainRef.current?.firstChild as HTMLElement).offsetHeight)
  }, [router.pathname])
  return (
    <>
      <Head>
        <title key={"title"}>Daniel Giljam</title>
      </Head>
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <Header />
        <div id={"__wrapper"}>
          <Main ref={mainRef} style={{height: mainHeight}}>
            <Component {...pageProps} />
          </Main>
          <Footer />
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
