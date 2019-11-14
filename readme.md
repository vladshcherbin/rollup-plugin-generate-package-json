# rollup-plugin-generate-package-json

[![Build Status](https://travis-ci.org/vladshcherbin/rollup-plugin-generate-package-json.svg?branch=master)](https://travis-ci.org/vladshcherbin/rollup-plugin-generate-package-json)
[![Codecov](https://codecov.io/gh/vladshcherbin/rollup-plugin-generate-package-json/branch/master/graph/badge.svg)](https://codecov.io/gh/vladshcherbin/rollup-plugin-generate-package-json)

Generate `package.json` file with packages from your bundle using Rollup.

## About

This plugin is useful when you have a lot of packages in your current `package.json` file and want to create a lean one with only packages from your generated bundle, probably for deployment.

## Installation

```bash
# yarn
yarn add rollup-plugin-generate-package-json -D

# npm
npm install rollup-plugin-generate-package-json -D
```

## Usage

```js
// rollup.config.js
import generatePackageJson from 'rollup-plugin-generate-package-json'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/app.js',
    format: 'cjs'
  },
  plugins: [
    generatePackageJson()
  ]
}
```

### Configuration

There are some useful options, all of them are optional:

#### inputFolder

Type: `string`\
Default: `current working directory`

Set input `package.json` folder.

```js
generatePackageJson({
  inputFolder: 'nested/folder'
})
```

#### outputFolder

Type: `string`\
Default: `bundle output folder`

Set output folder for generated `package.json` file.

```js
generatePackageJson({
  outputFolder: 'dist'
})
```

#### baseContents

Type: `object | function`\
Default: `{}`

Set base contents for your generated `package.json` file.

```js
generatePackageJson({
  baseContents: {
    scripts: {
      start: 'node app.js'
    },
    dependencies: {},
    private: true
  }
})
```

It can also be a function, which receives the contents of the input `package.json` file.

```js
generatePackageJson({
  baseContents: (pkg) => ({
    name: pkg.name,
    main: pkg.main.replace('src', 'dist')
    dependencies: {},
    private: true
  })
})
```

#### additionalDependencies

Type: `Array | object`\
Default: `[]`

Set dependencies which are not directly imported in the bundle, but are used by the app.

```js
generatePackageJson({
  additionalDependencies: ['pg']
})
```

It's also possible to add new dependencies or overwrite dependency version.

```js
generatePackageJson({
  additionalDependencies: {
    pg: '7.12.1',
    'react-calendar': 'file:../react-calendar/react-calendar-v2.13.2.tgz'
  }
})
```

## License

MIT
