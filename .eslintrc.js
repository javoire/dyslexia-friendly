module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true
  },
  plugins: ['jest'],
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  globals: {
    chrome: 'readable'
  }
};
