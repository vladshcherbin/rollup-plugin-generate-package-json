import path from 'path'
import fs from 'fs-extra'
import { rollup } from 'rollup'
import readPkg from 'read-pkg'
import generatePackageJson from '../src'

process.chdir(`${__dirname}/fixtures`)

async function build(options = {}) {
  const bundle = await rollup({
    input: `${options.inputFolder || 'src/dependencies'}/index.js`,
    plugins: [
      generatePackageJson(options)
    ],
    external: ['@google-cloud/bigquery', 'koa', 'uuid/v4']
  })

  await bundle.write({
    file: 'dist/app.js',
    format: 'cjs'
  })
}

function readDistPackageJson() {
  return readPkg({ cwd: 'dist', normalize: false })
}

afterEach(async () => {
  await fs.remove('dist')
})

test('throw if input package.json doesn\'t exist', async () => {
  await expect(build({ inputFolder: 'src/input-file-absent' }))
    .rejects.toThrow('Input package.json file does not exist or has bad format, check "inputFolder" option')
})

test('throw if not possible to save generated file', async () => {
  await expect(build({
    inputFolder: 'src/output-bad-format',
    outputFolder: 'src/output-bad-format/folder'
  })).rejects.toThrow('Unable to save generated package.json file, check "outputFolder" option')
})

test('no options', async () => {
  process.chdir(`${__dirname}/fixtures/src/dependencies`)

  const bundle = await rollup({
    input: 'index.js',
    plugins: [
      generatePackageJson()
    ],
    external: ['koa']
  })

  await bundle.write({
    file: path.resolve(process.cwd(), '../../dist/app.js'),
    format: 'cjs'
  })

  process.chdir(`${__dirname}/fixtures`)

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0'
    }
  })
})

test('no dependencies', async () => {
  await build({ inputFolder: 'src/no-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({})
})

test('missing dependencies', async () => {
  await build({ inputFolder: 'src/missing-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({})
})

test('dependencies', async () => {
  await build({ inputFolder: 'src/dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0'
    }
  })
})

test('base contents', async () => {
  await build({
    inputFolder: 'src/dependencies',
    baseContents: {
      name: 'my-package',
      dependencies: {},
      private: true
    }
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    name: 'my-package',
    dependencies: {
      koa: '2.0'
    },
    private: true
  })
})

test('base contents as function', async () => {
  await build({
    inputFolder: 'src/base-contents-function',
    baseContents: (pkg) => ({
      name: pkg.name,
      main: pkg.main.replace('src', 'dist'),
      dependencies: {},
      private: true
    })
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    name: 'test',
    main: 'dist/index.js',
    dependencies: {
      koa: '2.0'
    },
    private: true
  })
})

test('additional dependencies', async () => {
  await build({
    inputFolder: 'src/additional-dependencies',
    additionalDependencies: ['koa-router']
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0',
      'koa-router': '7.4'
    }
  })
})

test('subpath dependencies', async () => {
  await build({ inputFolder: 'src/subpath-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      uuid: '3.3'
    }
  })
})

test('scoped dependencies', async () => {
  await build({ inputFolder: 'src/scoped-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      '@google-cloud/bigquery': '4.4'
    }
  })
})

test('local dependencies', async () => {
  await build({
    inputFolder: 'src/local-dependencies',
    additionalDependencies: {
      koa: '2.11.0',
      'react-calendar': 'file:../react-calendar/react-calendar-v2.13.2.tgz'
    }
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.11.0',
      'react-calendar': 'file:../react-calendar/react-calendar-v2.13.2.tgz'
    }
  })
})

test('unique dependencies from multiple chunks', async () => {
  const bundle = await rollup({
    input: [
      'src/unique-dependencies/app-1.js',
      'src/unique-dependencies/app-2.js'
    ],
    plugins: [
      generatePackageJson({ inputFolder: 'src/unique-dependencies' })
    ],
    external: ['koa']
  })

  await bundle.write({
    dir: 'dist',
    format: 'cjs'
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0'
    }
  })
})

test('assets mixed with chunks', async () => {
  function addAsset() {
    return {
      name: 'add-asset',
      load() {
        this.emitFile({
          type: 'asset',
          source: 'console.log(\'hey\')',
          name: 'asset.js'
        })
      }
    }
  }

  const bundle = await rollup({
    input: 'src/assets/index.js',
    plugins: [
      addAsset(),
      generatePackageJson({ inputFolder: 'src/assets' })
    ]
  })

  await bundle.write({
    dir: 'dist',
    format: 'cjs'
  })

  await expect(readDistPackageJson()).resolves.toEqual({})
})
