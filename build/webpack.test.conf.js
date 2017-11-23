'use strict'
// This is the webpack config used for unit tests.
var nodeExternals = require('webpack-node-externals')

const webpackConfig = {
  // use inline sourcemap for karma-sourcemap-loader
  devtool: '#inline-source-map',
  resolveLoader: {
    alias: {
      'scss-loader': 'sass-loader'
    }
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  }
};

// no need for app entry during tests
// delete webpackConfig.entry;

module.exports = webpackConfig
