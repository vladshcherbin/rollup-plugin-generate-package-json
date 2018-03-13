import rimraf from 'rimraf'
import readPkg from 'read-pkg'
import generatePackageJson from '../src'

const bundleDetailsNoImports = {
  bundle: { imports: [] }
}

const bundleDetailsWithImports = {
  bundle: { imports: ['koa', 'koa-router'] }
}

describe('Input package.json file', () => {
  test('throw if packageJsonPath file does not exist', () => {
    expect(() => {
      generatePackageJson({ inputPackageJson: 'tests/fixtures/fake-package.json' })
    }).toThrow('Input package.json file does not exist or has bad format, check "inputPackageJson" option')
  })

  test('throw if packageJsonPath file has bad format', () => {
    expect(() => {
      generatePackageJson({ inputPackageJson: 'tests/fixtures/bad-package.json' })
    }).toThrow('Input package.json file does not exist or has bad format, check "inputPackageJson" option')
  })

  test('don\'t throw if packageJsonPath file exists and has normal format', () => {
    expect(() => {
      generatePackageJson({ inputPackageJson: 'tests/fixtures/empty-package.json' })
    }).not.toThrow()
  })

  test('don\'t throw if packageJsonPath directory has file', () => {
    expect(() => {
      generatePackageJson({ inputPackageJson: 'tests/fixtures' })
    }).not.toThrow()
  })
})

describe('Generate package.json file', () => {
  beforeEach(() => {
    rimraf.sync('tests/fixtures/output')
  })

  test('throw if it is not possible to save generated file', () => {
    expect(() => {
      const generate = generatePackageJson({
        outputFolder: 'tests/fixtures/non-writable'
      })

      generate.ongenerate(bundleDetailsNoImports)
      generate.onwrite()
    }).toThrow('Unable to save generated package.json file, check "outputFolder" option')
  })

  test('generate file when bundle and input package.json have no dependencies', () => {
    const generate = generatePackageJson({
      outputFolder: 'tests/fixtures/output'
    })

    generate.ongenerate(bundleDetailsNoImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({})
  })

  test('generate file when bundle has no dependencies, input package.json has dependencies', () => {
    const generate = generatePackageJson({
      inputPackageJson: 'tests/fixtures/package.json',
      outputFolder: 'tests/fixtures/output'
    })

    generate.ongenerate(bundleDetailsNoImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({})
  })

  test('generate file when bundle has dependencies, input package.json has no dependencies', () => {
    const generate = generatePackageJson({
      inputPackageJson: 'tests/fixtures/empty-package.json',
      outputFolder: 'tests/fixtures/output'
    })

    generate.ongenerate(bundleDetailsWithImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({})
  })

  test('generate file when bundle and input package.json have dependencies', () => {
    const generate = generatePackageJson({
      inputPackageJson: 'tests/fixtures/package.json',
      outputFolder: 'tests/fixtures/output'
    })

    generate.ongenerate(bundleDetailsWithImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({
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
      inputPackageJson: 'tests/fixtures/empty-package.json',
      outputFolder: 'tests/fixtures/output',
      baseContents: basePackageJson
    })

    generate.ongenerate(bundleDetailsWithImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({
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
      inputPackageJson: 'tests/fixtures/package.json',
      outputFolder: 'tests/fixtures/output',
      baseContents: basePackageJson
    })

    generate.ongenerate(bundleDetailsWithImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({
      name: 'my-package',
      dependencies: {
        koa: '2.0'
      },
      private: true
    })
  })

  test('generate file with additional dependencies', () => {
    const generate = generatePackageJson({
      inputPackageJson: 'tests/fixtures/package.json',
      outputFolder: 'tests/fixtures/output',
      additionalDependencies: ['react']
    })

    generate.ongenerate(bundleDetailsNoImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({
      dependencies: {
        react: '16.0'
      }
    })
  })

  test('generate file with dependencies, additional dependencies', () => {
    const generate = generatePackageJson({
      inputPackageJson: 'tests/fixtures/package.json',
      outputFolder: 'tests/fixtures/output',
      additionalDependencies: ['react']
    })

    generate.ongenerate(bundleDetailsWithImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({
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
      inputPackageJson: 'tests/fixtures/package.json',
      outputFolder: 'tests/fixtures/output',
      additionalDependencies: ['react'],
      baseContents: basePackageJson
    })

    generate.ongenerate(bundleDetailsWithImports)
    generate.onwrite()

    expect(readPkg.sync('tests/fixtures/output/package.json', { normalize: false })).toEqual({
      name: 'my-package',
      dependencies: {
        koa: '2.0',
        react: '16.0'
      },
      private: true
    })
  })

  test('generate file with no options and path from details', () => {
    const generate = generatePackageJson()

    generate.ongenerate(bundleDetailsNoImports)
    generate.onwrite({ file: 'tests/fixtures/output/app/app.js' })

    expect(readPkg.sync('tests/fixtures/output/app/package.json', { normalize: false })).toEqual({})
  })
})
