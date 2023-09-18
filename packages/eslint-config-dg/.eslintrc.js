/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['./library.js'],
  rules: {
    // This must be here otherwise the package dir it looks at is wrong
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: __dirname,
      },
    ],
  },
};
