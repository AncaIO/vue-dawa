process.env.NODE_ENV = 'development'

require('colors')

var express = require('express');
var webpack = require('webpack');
var config = require('../config');
var opn = require('opn');
var proxyMiddleware = require('http-proxy-middleware');
var webpackConfig = require('./webpack.dev.conf');
var app = express();
var port = process.env.PORT || config.dev.port
var uri = 'http://localhost:' + port

console.log(' Starting dev server at ' + uri.bold)
if (config.dev.openBrowser) {
  console.log(' Browser will open when build is ready.\n')
}

var compiler = webpack(webpackConfig)

// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: function () {}
})

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy requests like API. See /config/index.js -> dev.proxyTable
// https://github.com/chimurai/http-proxy-middleware
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  // open browser if set so in /config/index.js
  if (config.dev.openBrowser) {
    devMiddleware.waitUntilValid(function () {
      opn(uri)
    })
  }
})
