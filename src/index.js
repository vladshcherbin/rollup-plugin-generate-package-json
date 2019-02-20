import path from 'path'
import readPkg from 'read-pkg'
import writePkg from 'write-pkg'

function readPackageJson(folder) {
  try {
    const options = Object.assign({ normalize: false }, folder && { cwd: folder })

    return readPkg.sync(options)
  } catch (e) {
    throw new Error('Input package.json file does not exist or has bad format, check "inputFolder" option')
  }
}

function writePackageJson(folder, contents) {
  try {
    return writePkg.sync(folder, contents, { indent: 2 })
  } catch (e) {
    throw new Error('Unable to save generated package.json file, check "outputFolder" option')
  }
}

export default function (options = {}) {
  const baseContents = options.baseContents || {}
  const additionalDependencies = options.additionalDependencies || []

  return {
    name: 'generate-package-json',
    generateBundle: (outputOptions, bundle) => {
      const inputFile = readPackageJson(options.inputFolder)
      const outputFolder = options.outputFolder
        || outputOptions.dir
        || path.dirname(outputOptions.file)
      let dependencies = []

      Object.values(bundle).forEach((chunk) => {
        dependencies = [...dependencies, ...chunk.imports]
      })

      dependencies = Array.from(new Set([...dependencies, ...additionalDependencies])).sort()

      const inputFileDependencies = inputFile.dependencies
      const generatedDependencies = {}

      dependencies.forEach((dependency) => {
        if (inputFileDependencies && inputFileDependencies[dependency]) {
          generatedDependencies[dependency] = inputFileDependencies[dependency]
        }
      })

      const generatedContents = Object.assign(
        {},
        baseContents,
        Object.keys(generatedDependencies).length && {
          dependencies: generatedDependencies
        }
      )

      writePackageJson(outputFolder, generatedContents)
    }
  }
}
