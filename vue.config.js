const nodeExternals = require('webpack-node-externals')

module.exports = {
  configureWebpack: {
    devtool: 'inline-cheap-module-source-map',
    externals: [nodeExternals()],
    output: {
      libraryExport: 'default'
    }
  },
  css: {
    sourceMap: true,
    extract: true
  }
}
