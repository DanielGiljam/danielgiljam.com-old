import {promises as fs} from "fs"

type POIValidator = (poi: string, sourceNames: string[]) => boolean

const poiMarkerStart =
  "======> KEEP UP TO DATE! \\(see top of file for more information\\)"
const poiMarkerEnd = "<====== KEEP UP TO DATE!"

const poiRegex = new RegExp(
  `(?<=${poiMarkerStart})[\\s\\S]+(?=${poiMarkerEnd})`,
  "g",
)

const generalPOIValidator = (
  poi: string,
  sourceNames: string[],
  regexTemplate: (sourceName: string) => string,
): boolean => {
  let state = true
  sourceNames.forEach((sourceName) => {
    state = new RegExp(regexTemplate(sourceName), "i").test(poi)
  })
  return state
}

const popInstValidators: POIValidator[] = [
  (popInstPOI1: string, sourceNames: string[]): boolean =>
    generalPOIValidator(
      popInstPOI1,
      sourceNames,
      (name) =>
        `\\| \\(FN extends ${name}SupportedField \\? typeof ${name}\\.DIRECTIVE : never\\)`,
    ),
  (popInstPOI2: string, sourceNames: string[]): boolean =>
    generalPOIValidator(
      popInstPOI2,
      sourceNames,
      (name) => `${name}\\?: ${name}Config`,
    ),
]
const projectValidators: POIValidator[] = [
  (projectPOI1: string, sourceNames: string[]): boolean =>
    generalPOIValidator(projectPOI1, sourceNames, (name) => ``),
]

const collectMatches = (regex: RegExp, subjectString: string): string[] => {
  const matches: string[] = []
  let execResult: RegExpExecArray | null
  while ((execResult = regex.exec(subjectString)) != null) {
    matches.push(execResult[0])
  }
  return matches
}

const validateTypeDefinitions = async (
  popInstDefinitionFilePath: string,
  projectDefinitionFilePath: string,
  sourceNames: string[],
): Promise<boolean> => {
  const popInstDefinitionFile = await fs.readFile(
    popInstDefinitionFilePath,
    "utf-8",
  )
  const projectDefinitionFile = await fs.readFile(
    projectDefinitionFilePath,
    "utf-8",
  )
  const popInstPOIs = collectMatches(poiRegex, popInstDefinitionFile)
  let popInstValidity: boolean
  if (popInstPOIs.length === popInstValidators.length) {
    popInstValidity = popInstValidators.every((validator, index) =>
      validator(popInstPOIs[index], sourceNames),
    )
  } else {
    popInstValidity = false
  }
  const projectPOIs = collectMatches(poiRegex, projectDefinitionFile)
  let projectValidity: boolean
  if (projectPOIs.length === projectValidators.length) {
    projectValidity = projectValidators.every((validator, index) =>
      validator(projectPOIs[index], sourceNames),
    )
  } else {
    projectValidity = false
  }
  return popInstValidity && projectValidity
}

export default validateTypeDefinitions
