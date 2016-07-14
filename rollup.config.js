import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  moduleName: 'uturn',
  plugins: [
    babel({
      babelrc: false,
      presets: ['es2015-rollup']
    })
  ],
  sourceMap: true
}

