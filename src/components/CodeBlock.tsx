import Highlight, {Language, defaultProps} from "prism-react-renderer"
import theme from "prism-react-renderer/themes/vsDark"
import {ReactNode} from "react"

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

const languageRegex = /^(markup|bash|clike|c|cpp|css|javascript|jsx|coffeescript|actionscript|css-extr|diff|git|go|graphql|handlebars|json|less|makefile|markdown|objectivec|ocaml|python|reason|sass|scss|sql|stylus|tsx|typescript|wasm|yaml)$/
const isSupportedLanguage = (language?: string): language is Language =>
  languageRegex.test(language ?? "")

const CodeBlock = ({children, ...props}: CodeBlockProps): JSX.Element => {
  const {className} = props
  const language = className?.replace(/language-/, "")
  if (isSupportedLanguage(language)) {
    return (
      <Highlight
        {...defaultProps}
        code={children as string}
        language={language}
        theme={theme}>
        {({className, style, tokens, getLineProps, getTokenProps}) => (
          <code className={className} style={{...style}}>
            {tokens.map((line, i) => (
              <span key={i}>
                {language !== "bash" ? <span>{i + 1}</span> : undefined}
                <span key={i} {...getLineProps({line, key: i})}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({token, key})} />
                  ))}
                </span>
              </span>
            ))}
          </code>
        )}
      </Highlight>
    )
  } else {
    return (
      <code style={{backgroundColor: theme.plain.backgroundColor}}>
        {children}
      </code>
    )
  }
}

export default CodeBlock
