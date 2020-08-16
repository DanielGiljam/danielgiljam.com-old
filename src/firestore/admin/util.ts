import {promises as fs} from "fs"
import path from "path"
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

export const getImportablePaths = async (
  pathToDir: string,
  importPathToDir: string,
  extensions: string[] = ["ts"],
): Promise<string[]> => {
  const extensionRegex = new RegExp(`\\.(${extensions.join("|")})$`)
  const subDirentRegex = new RegExp(`^index\\.(${extensions.join("|")})$`)
  const dirents = await fs.readdir(pathToDir, {withFileTypes: true})
  const importablePaths = dirents.filter(
    (dirent) => dirent.isFile() && extensionRegex.test(dirent.name),
  )
  for (const dirent of dirents.filter((dirent) => dirent.isDirectory())) {
    const subDirents = await fs.readdir(path.resolve(pathToDir, dirent.name), {
      withFileTypes: true,
    })
    if (
      subDirents.some(
        (subDirent) =>
          subDirent.isFile() && subDirentRegex.test(subDirent.name),
      )
    ) {
      importablePaths.push(dirent)
    }
  }
  return importablePaths.map((dirent) => {
    const {dir, name} = path.posix.parse(
      path.posix.join(importPathToDir, dirent.name),
    )
    return `${dir}/${name}`
  })
}
