import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env', { targets: { node: 6 }, modules: false }]]
    })
  ],
  external: ['path', 'read-pkg', 'write-pkg']
}
