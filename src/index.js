import path from 'path'
import readPackage from 'read-pkg'
import writePackage from 'write-pkg'

async function readPackageJson(folder) {
  try {
    const options = Object.assign({ normalize: false }, folder && { cwd: folder })

    return await readPackage(options)
  } catch (e) {
    throw new Error('Input package.json file does not exist or has bad format, check "inputFolder" option')
  }
}

async function writePackageJson(folder, contents) {
  try {
    return await writePackage(folder, contents, { indent: 2 })
  } catch (e) {
    throw new Error('Unable to save generated package.json file, check "outputFolder" option')
  }
}

function normalizeImportModules(imports) {
  return imports.map((module) => {
    const pathParts = module.split(/[/\\]/)

    return (pathParts[0][0] === '@')
      ? `${pathParts[0]}/${pathParts[1]}`
      : pathParts[0]
  })
}

export default function generatePackageJson(options = {}) {
  const {
    additionalDependencies = [],
    baseContents = {},
    inputFolder,
    outputFolder
  } = options

  return {
    name: 'generate-package-json',
    generateBundle: async (outputOptions, bundle) => {
      const inputFile = await readPackageJson(inputFolder)
      const outputPath = outputFolder
        || outputOptions.dir
        || path.dirname(outputOptions.file)
      let dependencies = []

      Object.values(bundle).forEach((chunk) => {
        if (chunk.imports) {
          dependencies = [...dependencies, ...normalizeImportModules(chunk.imports)]
        }
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

      await writePackageJson(outputPath, generatedContents)
    }
  }
}
