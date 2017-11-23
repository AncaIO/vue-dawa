var shell = require('shelljs')
var path = require('path')

shell.rm('-rf', path.resolve(__dirname, '../dist/*'))
console.log(' Cleaned build artifacts.\n')
