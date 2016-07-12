import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  moduleName: 'uturn',
  plugins: [buble()],
  external: [],
  globals: {},
  sourceMap: true
}

