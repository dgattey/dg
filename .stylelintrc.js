module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-config-styled-components'],
  plugins: [
    'stylelint-color-format',
    'stylelint-declaration-block-no-ignored-properties',
    'stylelint-z-index-value-constraint',
    'stylelint-no-restricted-syntax',
    'stylelint-csstree-validator',
    'stylelint-declaration-block-no-ignored-properties',
  ],
  rules: {
    'color-format/format': {
      format: 'rgb',
    },
    'plugin/declaration-block-no-ignored-properties': true,
    'plugin/z-index-value-constraint': {
      min: 1,
      max: 1,
    },
    'csstree/validator': {
      syntaxExtensions: ['sass'],
    },
    'plugin/declaration-block-no-ignored-properties': true,
    'function-no-unknown': null,
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      customSyntax: '@stylelint/postcss-css-in-js',
    },
  ],
};
