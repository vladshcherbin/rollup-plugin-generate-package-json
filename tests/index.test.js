import rimraf from 'rimraf'
import readPkg from 'read-pkg'
import generatePackageJson from '../src'

const bundleDetailsNoImports = {
  'app.js': { imports: [] }
}

const bundleDetailsWithImports = {
  'app.js': { imports: ['koa', 'koa-router'] }
}

const bundleDetailsWithSubpathImports = {
  'app.js': { imports: ['koa', 'uuid/v4'] }
}

const bundleDetailsWithImportsMultipleChunks = {
  'part-1.js': { imports: ['koa', 'koa-router'] },
  'part-2.js': { imports: ['koa', 'koa-router', 'react'] }
}

describe('Input package.json file', () => {
  test('throw if does not exist', () => {
    expect(() => {
      const generate = generatePackageJson({ inputFolder: 'tests/fixtures/fake-package' })

      generate.generateBundle({}, bundleDetailsNoImports)
    }).toThrow('Input package.json file does not exist or has bad format, check "inputFolder" option')

    expect(() => {
      const generate = generatePackageJson({ inputFolder: 'tests/fixtures/fake-package.json' })

      generate.generateBundle({}, bundleDetailsNoImports)
    }).toThrow('Input package.json file does not exist or has bad format, check "inputFolder" option')
  })

  test('throw if file has bad format', () => {
    expect(() => {
      const generate = generatePackageJson({ inputFolder: 'tests/fixtures/bad' })

      generate.generateBundle({}, bundleDetailsNoImports)
    }).toThrow('Input package.json file does not exist or has bad format, check "inputFolder" option')
  })

  test('don\'t throw if file exists and is empty', () => {
    expect(() => {
      const generate = generatePackageJson({ inputFolder: 'tests/fixtures/empty' })

      generate.generateBundle({ dir: 'tests/fixtures/output' }, bundleDetailsNoImports)
    }).not.toThrow()

    rimraf.sync('tests/fixtures/output')
  })

  test('don\'t throw if file exists at root path and has basic structure', () => {
    expect(() => {
      const generate = generatePackageJson()

      generate.generateBundle({ dir: 'tests/fixtures/output' }, bundleDetailsNoImports)
    }).not.toThrow()

    rimraf.sync('tests/fixtures/output')
  })
})

describe('Generate package.json file', () => {
  afterEach(() => {
    rimraf.sync('tests/fixtures/output')
  })

  test('throw if it is not possible to save generated file', () => {
    expect(() => {
      const generate = generatePackageJson({
        outputFolder: 'tests/fixtures/folder'
      })

      generate.generateBundle({}, bundleDetailsNoImports)
    }).toThrow('Unable to save generated package.json file, check "outputFolder" option')
  })

  test('generate file when bundle and input package.json have no dependencies', () => {
    const generate = generatePackageJson({
      outputFolder: 'tests/fixtures/output'
    })

    generate.generateBundle({}, bundleDetailsNoImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({})
  })

  test('generate file when bundle has no dependencies, input package.json has dependencies', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output'
    })

    generate.generateBundle({}, bundleDetailsNoImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({})
  })

  test('generate file when bundle has dependencies, input package.json has no dependencies', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures/empty',
      outputFolder: 'tests/fixtures/output'
    })

    generate.generateBundle({}, bundleDetailsWithImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({})
  })

  test('generate file when bundle and input package.json have dependencies', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output'
    })

    generate.generateBundle({}, bundleDetailsWithImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      dependencies: {
        koa: '2.0'
      }
    })
  })

  test('generate file with base contents', () => {
    const basePackageJson = {
      name: 'my-package',
      dependencies: {},
      private: true
    }
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures/empty',
      outputFolder: 'tests/fixtures/output',
      baseContents: basePackageJson
    })

    generate.generateBundle({}, bundleDetailsWithImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      name: 'my-package',
      private: true
    })
  })

  test('generate file with base contents and dependencies', () => {
    const basePackageJson = {
      name: 'my-package',
      dependencies: {},
      private: true
    }
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output',
      baseContents: basePackageJson
    })

    generate.generateBundle({}, bundleDetailsWithImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      name: 'my-package',
      dependencies: {
        koa: '2.0'
      },
      private: true
    })
  })

  test('generate file with additional dependencies', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output',
      additionalDependencies: ['react']
    })

    generate.generateBundle({}, bundleDetailsNoImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      dependencies: {
        react: '16.0'
      }
    })
  })

  test('generate file with dependencies, additional dependencies', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output',
      additionalDependencies: ['react']
    })

    generate.generateBundle({}, bundleDetailsWithImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      dependencies: {
        koa: '2.0',
        react: '16.0'
      }
    })
  })

  test('generate file with dependencies, additional dependencies and base contents', () => {
    const basePackageJson = {
      name: 'my-package',
      dependencies: {},
      private: true
    }
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output',
      additionalDependencies: ['react'],
      baseContents: basePackageJson
    })

    generate.generateBundle({}, bundleDetailsWithImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      name: 'my-package',
      dependencies: {
        koa: '2.0',
        react: '16.0'
      },
      private: true
    })
  })

  test('generate file with subpath dependencies', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures/subpath',
      outputFolder: 'tests/fixtures/output'
    })

    generate.generateBundle({}, bundleDetailsWithSubpathImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      dependencies: {
        koa: '2.0',
        uuid: '3.0'
      }
    })
  })

  test('generate file with unique dependencies from multiple chunks', () => {
    const generate = generatePackageJson({
      inputFolder: 'tests/fixtures',
      outputFolder: 'tests/fixtures/output'
    })

    generate.generateBundle({}, bundleDetailsWithImportsMultipleChunks)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output', normalize: false })).toEqual({
      dependencies: {
        koa: '2.0',
        react: '16.0'
      }
    })
  })

  test('generate file with no options and path from details', () => {
    const generate = generatePackageJson()

    generate.generateBundle({ file: 'tests/fixtures/output/app/app.js' }, bundleDetailsNoImports)

    expect(readPkg.sync({ cwd: 'tests/fixtures/output/app', normalize: false })).toEqual({})
  })
})
