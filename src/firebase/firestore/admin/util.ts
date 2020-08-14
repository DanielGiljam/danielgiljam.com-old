import {URL} from "url"

export const nameRegex = /(?<=^# ).*/
export const latestReleaseVersionRegex = /(?<=v?)\d\.\d\.\d/

export const removeHeading1: [RegExp, string] = [/^# .*\n*/, ""]
export const fixMDXBreakingBrTags: [RegExp, string] = [/^# .*\n*/, "<br />"]
export const replaceImageSourcesRelativeWithAbsolute = (
  url: string,
): [RegExp, (match: string) => string] => [
  /(?<=!\[.*\]\()(?!https?:\/\/).*(?=\))/g,
  (match) => new URL(match, url).toString(),
]
