module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [ 'airbnb-base', 'eslint:recommended'],
  overrides: [
  {
    files: [ '*.js' ],
    rules: {
      'class-methods-use-this': 'off',
      'no-plusplus': 'off',
      'no-console': 'off',
    }
  }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
  },
};
