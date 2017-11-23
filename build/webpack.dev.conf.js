var config = require('../config')
var webpack = require('webpack');
var merge = require('webpack-merge');
var baseWebpackConfig = require('./webpack.base.conf');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
var cssUtils = require('./css-utils');

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/hot-reload'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  // eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  module: {
    rules: cssUtils.styleRules({
      sourceMap: config.dev.cssSourceMap,
      postcss: true
    })
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'dev/index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin({
      clearConsole: config.dev.clearConsoleOnRebuild
    })
  ],
  performance: {
    hints: false
  }
});
