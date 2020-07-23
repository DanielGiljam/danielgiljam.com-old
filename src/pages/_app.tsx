import CssBaseline from "@material-ui/core/CssBaseline"
import {
  ThemeProvider,
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles"
import {AppProps} from "next/app"

import createTheme from "../theme/createTheme"

const App = ({Component, pageProps}: AppProps): JSX.Element => (
  <ThemeProvider
    theme={createTheme(
      responsiveFontSizes(createMuiTheme({palette: {type: "dark"}})),
    )}>
    <CssBaseline />
    <Component {...pageProps} />
  </ThemeProvider>
)

export default App
