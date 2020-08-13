declare module "@mdx-js/mdx" {
  const mdx: (mdx: string, opts?: {skipExport?: boolean}) => Promise<string>
  export const sync: (mdx: string, opts?: {skipExport?: boolean}) => string
  export default mdx
}

/** Inspired by the code sample at https://mdxjs.com/advanced/typescript */
declare module "@mdx-js/react" {
  import React from "react"

  type ComponentType =
    | "p"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "thematicBreak"
    | "blockquote"
    | "ul"
    | "ol"
    | "li"
    | "table"
    | "thead"
    | "tbody"
    | "tr"
    | "td"
    | "th"
    | "pre"
    | "code"
    | "em"
    | "strong"
    | "del"
    | "inlineCode"
    | "hr"
    | "a"
    | "img"

  export type Components = {
    [key in ComponentType]?: React.ComponentType
  }

  export interface MDXProviderProps {
    components?: Components
  }

  export class MDXProvider extends React.Component<MDXProviderProps> {}

  export const mdx: any
}
