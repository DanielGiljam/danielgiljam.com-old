import Typography, {TypographyProps} from "@material-ui/core/Typography"
import LinkIcon from "@material-ui/icons/LinkRounded"
import {ReactNode} from "react"

interface HeadingProps {
  children: ReactNode
  variant: TypographyProps["variant"]
  id?: string
}

const Heading = ({children, variant, id}: HeadingProps): JSX.Element => {
  return (
    <Typography
      variant={variant}
      variantMapping={{
        h2: "h1",
        h3: "h2",
        h4: "h3",
        h5: "h4",
        h6: "h5",
        subtitle1: "h6",
      }}>
      {children}
      <a aria-hidden={"true"} href={id != null ? "#" + id : undefined}>
        <LinkIcon />
      </a>
    </Typography>
  )
}

export default Heading
