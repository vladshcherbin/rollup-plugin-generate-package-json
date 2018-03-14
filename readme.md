# rollup-plugin-generate-package-json

[![Build Status](https://travis-ci.org/vladshcherbin/rollup-plugin-generate-package-json.svg?branch=master)](https://travis-ci.org/vladshcherbin/rollup-plugin-generate-package-json)
[![Codecov](https://codecov.io/gh/vladshcherbin/rollup-plugin-generate-package-json/branch/master/graph/badge.svg)](https://codecov.io/gh/vladshcherbin/rollup-plugin-generate-package-json)

Generate `package.json` file with packages from your bundle using Rollup.

## About

This plugin is useful when you have a lot of packages in your current `package.json` and want to create a lean one with only packages from your generated bundle, probably for deployment.

## Installation

```bash
npm install rollup-plugin-generate-package-json --save-dev
# or
yarn add rollup-plugin-generate-package-json -D
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

### Options

There are some useful options, all of them are optional:

**inputPackageJson**

Set input `package.json` file path, it can be a file or a directory. By default, root `package.json` file is used.

```js
generatePackageJson({
  inputPackageJson: 'nested/folder'
})
```

**outputFolder**

Set output folder where generated `package.json` file will be saved. By default, it is the same folder where bundle was saved.

```js
generatePackageJson({
  outputFolder: 'dist'
})
```

**baseContents**

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

**additionalDependencies**

Set additional dependencies which were not used in the bundle, but are used by the app.

```js
generatePackageJson({
  additionalDependencies: ['pg']
})
```

## License

MIT
