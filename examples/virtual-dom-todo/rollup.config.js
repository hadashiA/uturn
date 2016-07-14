import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'src/index.js',
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
    }),
  ],
  external: [],
  globals: {},
  sourceMap: true
}

