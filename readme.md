# rollup-plugin-generate-package-json

[![Build Status](https://travis-ci.org/VladShcherbin/rollup-plugin-generate-package-json.svg?branch=master)](https://travis-ci.org/VladShcherbin/rollup-plugin-generate-package-json)
[![Codecov](https://img.shields.io/codecov/c/github/VladShcherbin/rollup-plugin-generate-package-json.svg)](https://codecov.io/gh/VladShcherbin/rollup-plugin-generate-package-json)

Generate `package.json` file with packages from your bundle using Rollup.

## Why

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
import path from 'path'
import generatePackageJson from 'rollup-plugin-generate-package-json'

const basePackageJson = {
  scripts: {
    start: 'node app.js'
  },
  dependencies: {},
  private: true
}

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/app.js',
    format: 'cjs'
  },
  plugins: [
    generatePackageJson({
      // By default, the plugin searches for package.json file.
      // Optionally, you can specify its path
      inputFile: path.resolve(__dirname, '../package.json'),

      // Set output folder, where generated package.json file will be saved
      outputFolder: path.resolve(__dirname, '../dist'),

      // Optionally, you can set base contents for your generated package.json file
      baseContents: basePackageJson
    })
  ]
}
```

## License

MIT
