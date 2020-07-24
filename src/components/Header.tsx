// @ts-expect-error webpack + svg-inline-loader takes care of importing the SVG file
import danielgiljam from "../../assets/danielgiljam.svg"

const Header = (): JSX.Element => (
  <header dangerouslySetInnerHTML={{__html: danielgiljam}} />
)

export default Header
