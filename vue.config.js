module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  },
  css: {
    // Enable CSS source maps.
    sourceMap: true,
    extract: false
  }
}
