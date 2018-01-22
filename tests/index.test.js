jest.mock('fs')

const { vol } = require('memfs')
const generatePackageJson = require('../src')

afterEach(() => {
  vol.reset()
})

function stringify(contents) {
  return JSON.stringify(contents, null, 2)
}

const packageJsonErrorMessage = 'Package.json file can\'t be found, check "inputFile" option'
const packageJsonWrongFormatErrorMessage = 'Package.json file has wrong format'
const outputFolderErrorMessage = 'Output folder was not set or can\'t be found, check "outputFolder" option'

const emptyPackageJson = stringify({})
const nonEmptyPackageJson = stringify({
  version: '1.0',
  dependencies: {
    koa: '2.0',
    react: '16.0'
  }
})
const basePackageJson = {
  name: 'my-package',
  dependencies: {},
  private: true
}

const bundleDetailsNoImports = {
  bundle: { imports: [] }
}
const bundleDetailsWithImports = {
  bundle: { imports: ['koa', 'koa-router'] }
}

describe('Input package.json file', () => {
  beforeEach(() => {
    vol.mkdirpSync('/dist')
  })

  test('throw when "inputFile" is not set and file doesn\'t exist', () => {
    vol.fromJSON({})

    expect(() => {
      generatePackageJson({
        outputFolder: '/dist'
      })
    }).toThrow(packageJsonErrorMessage)
  })

  test('don\'t throw when "inputFile" is not set and file exists', () => {
    vol.fromJSON({ '/package.json': emptyPackageJson })

    expect(() => {
      generatePackageJson({
        outputFolder: '/dist'
      })
    }).not.toThrow()
  })

  test('throw when "inputFile" is set and file doesn\'t exist', () => {
    vol.fromJSON({})

    expect(() => {
      generatePackageJson({
        inputFile: '/src/package.json',
        outputFolder: '/dist'
      })
    }).toThrow(packageJsonErrorMessage)
  })

  test('don\'t throw when "inputFile" is set and file exists', () => {
    vol.fromJSON({ '/src/package.json': emptyPackageJson })

    expect(() => {
      generatePackageJson({
        inputFile: '/src/package.json',
        outputFolder: '/dist'
      })
    }).not.toThrow()
  })

  test('throw when "inputFile" is not set and file exists, but has wrong format', () => {
    vol.fromJSON({ '/package.json': 'hey' })

    expect(() => {
      generatePackageJson({
        outputFolder: '/dist'
      }).ongenerate(bundleDetailsWithImports)
    }).toThrow(packageJsonWrongFormatErrorMessage)
  })

  test('throw when "inputFile" is set and file exists, but has wrong format', () => {
    vol.fromJSON({ '/src/package.json': 'hey' })

    expect(() => {
      generatePackageJson({
        inputFile: '/src/package.json',
        outputFolder: '/dist'
      }).ongenerate(bundleDetailsWithImports)
    }).toThrow(packageJsonWrongFormatErrorMessage)
  })
})

describe('Output folder', () => {
  beforeEach(() => {
    vol.fromJSON({ '/package.json': emptyPackageJson })
  })

  test('throw when "outputFolder" is not set', () => {
    expect(() => {
      generatePackageJson()
    }).toThrow(outputFolderErrorMessage)
  })

  test('throw when "outputFolder" is set and folder doesn\'t exist', () => {
    vol.mkdirpSync('/dist')

    expect(() => {
      generatePackageJson({
        outputFolder: '/build'
      })
    }).toThrow(outputFolderErrorMessage)
  })

  test('don\'t throw when "outputFolder" is set and folder exists', () => {
    vol.mkdirpSync('/dist')

    expect(() => {
      generatePackageJson({
        outputFolder: '/dist'
      })
    }).not.toThrow()
  })
})

describe('Generate package.json', () => {
  beforeEach(() => {
    vol.mkdirpSync('/dist')
  })

  test('overwrite existing package.json file', () => {
    vol.fromJSON({ '/package.json': stringify({ name: 'my-package' }) })

    generatePackageJson({
      outputFolder: '/'
    }).ongenerate(bundleDetailsWithImports)

    expect(vol.toJSON()['/package.json']).toBe(emptyPackageJson)
  })

  test('generate file with no modules when bundle has no modules, input package.json hasn\'t modules', () => {
    vol.fromJSON({ '/package.json': emptyPackageJson })

    generatePackageJson({
      outputFolder: '/dist'
    }).ongenerate(bundleDetailsNoImports)

    expect(vol.toJSON()['/dist/package.json']).toBe(emptyPackageJson)
  })

  test('generate file with no modules when bundle has no modules, input package.json has modules', () => {
    vol.fromJSON({ '/package.json': nonEmptyPackageJson })

    generatePackageJson({
      outputFolder: '/dist'
    }).ongenerate(bundleDetailsNoImports)

    expect(vol.toJSON()['/dist/package.json']).toBe(emptyPackageJson)
  })

  test('generate file with no modules when bundle has modules, input package.json hasn\'t modules', () => {
    vol.fromJSON({ '/package.json': emptyPackageJson })

    generatePackageJson({
      outputFolder: '/dist'
    }).ongenerate(bundleDetailsWithImports)

    expect(vol.toJSON()['/dist/package.json']).toBe(emptyPackageJson)
  })

  test('generate file with modules when bundle has modules, input package.json has modules', () => {
    vol.fromJSON({ '/package.json': nonEmptyPackageJson })

    generatePackageJson({
      outputFolder: '/dist'
    }).ongenerate(bundleDetailsWithImports)

    const expectedPackageJson = stringify({
      dependencies: {
        koa: '2.0'
      }
    })

    expect(vol.toJSON()['/dist/package.json']).toBe(expectedPackageJson)
  })

  test('generate file when "base" is not set', () => {
    vol.fromJSON({ '/package.json': emptyPackageJson })

    generatePackageJson({
      outputFolder: '/dist'
    }).ongenerate(bundleDetailsWithImports)

    expect(vol.toJSON()['/dist/package.json']).toBe(emptyPackageJson)
  })

  describe('"base" is set', () => {
    test('generate file with base contents', () => {
      vol.fromJSON({ '/package.json': emptyPackageJson })

      generatePackageJson({
        outputFolder: '/dist',
        baseContents: basePackageJson
      }).ongenerate(bundleDetailsWithImports)

      expect(vol.toJSON()['/dist/package.json']).toBe(stringify(basePackageJson))
    })

    test('generate file with base contents, no modules when bundle has no modules, input package.json hasn\'t modules', () => {
      vol.fromJSON({ '/package.json': emptyPackageJson })

      generatePackageJson({
        outputFolder: '/dist',
        baseContents: basePackageJson
      }).ongenerate(bundleDetailsNoImports)

      expect(vol.toJSON()['/dist/package.json']).toBe(stringify(basePackageJson))
    })

    test('generate file with base contents, no modules when bundle has no modules, input package.json has modules', () => {
      vol.fromJSON({ '/package.json': nonEmptyPackageJson })

      generatePackageJson({
        outputFolder: '/dist',
        baseContents: basePackageJson
      }).ongenerate(bundleDetailsNoImports)

      expect(vol.toJSON()['/dist/package.json']).toBe(stringify(basePackageJson))
    })

    test('generate file with base contents, no modules when bundle has modules, input package.json hasn\'t modules', () => {
      vol.fromJSON({ '/package.json': emptyPackageJson })

      generatePackageJson({
        outputFolder: '/dist',
        baseContents: basePackageJson
      }).ongenerate(bundleDetailsWithImports)

      expect(vol.toJSON()['/dist/package.json']).toBe(stringify(basePackageJson))
    })

    test('generate file with base contents, modules when bundle has modules, input package.json has modules', () => {
      vol.fromJSON({ '/package.json': nonEmptyPackageJson })

      generatePackageJson({
        outputFolder: '/dist',
        baseContents: basePackageJson
      }).ongenerate(bundleDetailsWithImports)

      const expectedPackageJson = stringify(Object.assign({}, basePackageJson, {
        dependencies: {
          koa: '2.0'
        }
      }))

      expect(vol.toJSON()['/dist/package.json']).toBe(expectedPackageJson)
    })
  })
})
