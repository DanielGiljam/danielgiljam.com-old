export interface Release {
  version: string

  date: string
}

export interface ProjectURL {
  type: "GitHub" | "NPM"
  url: string
}

// #region PROJECT INTERFACE DEFINITION
interface Project {
  id: string
  name: string
  slug: string
  releases: Release[]
  firstReleaseDate: string[]
  latestReleaseDate: string[]
  urls: ProjectURL[]
}
// #endregion

export interface ProjectAsProp {
  project: Project
}

export interface ProjectsAsProp {
  projects: Project[]
}

export default Project
