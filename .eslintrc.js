module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  globals: {
    'cordova': true,
    'DEV': true,
    'PROD': true,
    '__THEME': true
  },

  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'one-var': 0,
    'import/first': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'brace-style': [2, 'stroustrup', { 'allowSingleLine': false }],
    'semi': 2,
    'no-useless-escape': 1,
    'comma-dangle': 2
  }
}
