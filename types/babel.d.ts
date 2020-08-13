declare module "@babel/core" {
  export const transform: (
    source: string,
    opts?: {plugins?: string[]},
  ) => {code: string}
}
