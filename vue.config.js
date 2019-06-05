const nodeExternals = require('webpack-node-externals')

module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    externals: [nodeExternals()]
  },
  css: {
    sourceMap: true,
    extract: false
  }
}
