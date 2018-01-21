const path = require('path')
const fs = require('fs')

function checkInputPackageJsonFile(inputFilePath) {
  if (!fs.existsSync(inputFilePath)) {
    throw new Error('Package.json file can\'t be found, check "inputFile" option')
  }
}

function checkOutputFolder(outputFolderPath) {
  if (!outputFolderPath || !fs.existsSync(path.resolve(outputFolderPath))) {
    throw Error('Output folder was not set or can\'t be found, check "outputFolder" option')
  }
}

function parseInputPackageJsonFile(inputFilePath) {
  try {
    return JSON.parse(fs.readFileSync(inputFilePath))
  } catch (e) {
    throw new Error('Package.json file has wrong format')
  }
}

function formatPackageJson(generatedContents) {
  return JSON.stringify(generatedContents, null, 2)
}

module.exports = (options = {}) => {
  const inputPackageJsonPath = path.resolve(options.inputFile || 'package.json')

  checkInputPackageJsonFile(inputPackageJsonPath)
  checkOutputFolder(options.outputFolder)

  return {
    name: 'generate-package-json',
    ongenerate: ({ bundle }) => {
      const inputPackageJson = parseInputPackageJsonFile(inputPackageJsonPath)
      const baseContents = options.base || {}
      const bundledDependencies = {}

      bundle.imports.forEach((importedModule) => {
        if (inputPackageJson.dependencies && inputPackageJson.dependencies[importedModule]) {
          bundledDependencies[importedModule] = inputPackageJson.dependencies[importedModule]
        }
      })

      const outputPackageJson = Object.assign(
        {},
        baseContents,
        Object.keys(bundledDependencies).length && {
          dependencies: bundledDependencies
        }
      )

      fs.writeFileSync(`${options.outputFolder}/package.json`, formatPackageJson(outputPackageJson))
    }
  }
}
