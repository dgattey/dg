module.exports = {
  useTabs: false,
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 70,
        useTabs: false,
        trailingComma: 'none',
        arrowParens: 'avoid',
        proseWrap: 'never',
      },
    },
    {
      files: '*.{json,babelrc,eslintrc,remarkrc,prettierrc}',
      options: {
        useTabs: false,
      },
    },
  ],
};
