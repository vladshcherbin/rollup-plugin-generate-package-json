import path from 'path'
import readPkg from 'read-pkg'
import writePkg from 'write-pkg'

function readPackageJson(filePath) {
  try {
    return readPkg.sync(filePath, { normalize: false })
  } catch (e) {
    throw new Error('Input package.json file does not exist or has bad format, check "inputPackageJson" option')
  }
}

function writePackageJson(folder, contents) {
  try {
    return writePkg.sync(folder, contents)
  } catch (e) {
    throw new Error('Unable to save generated package.json file, check "outputFolder" option')
  }
}

export default function (options = {}) {
  const inputPackageJson = readPackageJson(options.inputPackageJson)
  const baseContents = options.baseContents || {}
  const additionalDependencies = options.additionalDependencies || []
  let dependencies = []

  return {
    name: 'generate-package-json',
    ongenerate: ({ bundle }) => {
      dependencies = [...bundle.imports, ...additionalDependencies].sort()
    },
    onwrite: (details) => {
      const outputPackageJson = options.outputFolder || path.dirname(details.file)
      const inputPackageJsonDependencies = inputPackageJson.dependencies
      const generatedDependencies = {}

      dependencies.forEach((dependency) => {
        if (inputPackageJsonDependencies && inputPackageJsonDependencies[dependency]) {
          generatedDependencies[dependency] = inputPackageJsonDependencies[dependency]
        }
      })

      const generatedJson = Object.assign(
        {},
        baseContents,
        Object.keys(generatedDependencies).length && {
          dependencies: generatedDependencies
        }
      )

      writePackageJson(outputPackageJson, generatedJson)
    }
  }
}
