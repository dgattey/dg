module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-config-styled-components'],
  rules: {
    'selector-type-no-unknown': [true, { ignoreTypes: '/-styled.*/' }],
    'value-keyword-case': [
      'lower',
      {
        ignoreKeywords: ['dummyValue'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      customSyntax: '@stylelint/postcss-css-in-js',
    },
  ],
};
