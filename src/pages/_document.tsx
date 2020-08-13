import {ServerStyleSheets} from "@material-ui/core/styles"
import {MinifierOutput} from "clean-css"
import _document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document"
import {Processor} from "postcss"
import React from "react"

/**
 * CSS minification/post-processing is heavily inspired by
 * how its done for the Material-UI docs site.
 * https://github.com/mui-org/material-ui/blob/next/docs/pages/_document.js
 */
let prefixer: Processor
let cleanCSS: MinifierOutput
if (process.env.NODE_ENV === "production") {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const postcss = require("postcss")
  const autoprefixer = require("autoprefixer")
  const CleanCSS = require("clean-css")
  /* eslint-enable @typescript-eslint/no-var-requires */
  prefixer = postcss([autoprefixer])
  cleanCSS = new CleanCSS()
}

class Document extends _document {
  render(): JSX.Element {
    return (
      <Html lang={"en"}>
        <Head>
          {/* PWA primary color */}
          <meta content={"#303030"} name={"theme-color"} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }

  // `getInitialProps` belongs to `_document` (instead of `_app`),
  // it's compatible with server-side generation (SSG).
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    // Resolution order
    //
    // On the server:
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. document.getInitialProps
    // 4. app.render
    // 5. page.render
    // 6. document.render
    //
    // On the server with error:
    // 1. document.getInitialProps
    // 2. app.render
    // 3. page.render
    // 4. document.render
    //
    // On the client
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. app.render
    // 4. page.render

    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets()
    const originalRenderPage = ctx.renderPage

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
      })

    const initialProps = await _document.getInitialProps(ctx)

    let css = sheets.toString()
    if (
      css != null &&
      css.length !== 0 &&
      process.env.NODE_ENV === "production"
    ) {
      const processedCSSPass1 = await prefixer.process(css)
      css = cleanCSS.minify(processedCSSPass1.css).styles
    }

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [
        ...React.Children.toArray(initialProps.styles),
        <style
          key={"jss-server-side"}
          dangerouslySetInnerHTML={{__html: css}}
          id={"jss-server-side"}
        />,
      ],
    }
  }
}

export default Document
