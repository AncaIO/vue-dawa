process.env.NODE_ENV = 'production'

require('colors')

var shell = require('shelljs')
var path = require('path')
var css = require('./css-utils')
var config = require('../config')
var webpack = require('webpack')
var webpackConfig = require('./webpack.prod.conf')
var targetPath = path.join(__dirname, '../dist/')

console.log(' WARNING!'.bold)

require('./script.clean.js')

shell.mkdir('-p', targetPath)

function finalize () {
  console.log(' Built files are meant to be served over an HTTP server.'.bold)
  console.log(' Opening index.html over file:// won\'t work.'.bold)
}

webpack(webpackConfig, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')

  if (config.build.purifyCSS) {
    css.purify(finalize)
  } else {
    finalize()
  }
})
