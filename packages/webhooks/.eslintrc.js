/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['dg/library'],
  rules: {
    // This must be here otherwise the package dir it looks at is wrong
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: __dirname,
      },
    ],
    // We want console statements for the scripts
    'no-console': 'off',
  },
};
