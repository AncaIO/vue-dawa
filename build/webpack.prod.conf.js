var path = require('path')
var config = require('../config')
var cssUtils = require('./css-utils')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    filename: 'vue-dawa.min.js',
    library: 'VueDawa',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: cssUtils.styleRules({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      postcss: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: config.build.productionSourceMap,
      minimize: true,
      compress: {
        warnings: false
      }
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: 'vue-dawa.min.css'
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true,
        discardComments: { removeAll: true }
      },
      cssProcessor: require('cssnano'),
      canPrint: true
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    new webpack.optimize.AggressiveMergingPlugin() // Merge chunks
  ]
})
