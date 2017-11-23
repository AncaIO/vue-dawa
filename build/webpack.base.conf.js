var path = require('path')
var webpack = require('webpack');
var config = require('../config');
var cssUtils = require('./css-utils');
var env = require('./env-utils');
var merge = require('webpack-merge');
var projectRoot = path.resolve(__dirname, '../');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var useCssSourceMap =
  (env.dev && config.dev.cssSourceMap) ||
  (env.prod && config.build.productionSourceMap);

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: env.prod ? './src/index.js' : './dev/index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    publicPath: config[env.prod ? 'build' : 'dev'].publicPath,
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [resolve('src'), resolve('node_modules')],
    alias: config.aliases
  },
  module: {
    rules: [
      {
        // eslint
        enforce: 'pre',
        test: /\.(vue|js)$/,
        loader: 'eslint-loader',
        include: projectRoot,
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: projectRoot,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          postcss: cssUtils.postcss,
          loaders: merge(
            { js: 'babel-loader' },
            cssUtils.styleLoaders({
              sourceMap: useCssSourceMap,
              extract: env.prod
            })
          )
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env': config[env.prod ? 'build' : 'dev'].env,
      DEV: env.dev,
      PROD: env.prod
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: env.prod,
      options: {
        context: path.resolve(__dirname, '../src'),
        postcss: cssUtils.postcss
      }
    }),
    new ProgressBarPlugin({
      format: config.progressFormat
    })
  ]
};
if (process.env.NODE_ENV === 'test') {
  // exclude NPM deps from test bundle
  module.exports.externals = [require('webpack-node-externals')()]
  // use inline source map so that it works with mocha-webpack
  module.exports.devtool = 'inline-cheap-module-source-map'
}
