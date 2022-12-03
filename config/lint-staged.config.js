module.exports = {
  // In js/jsx/ts/tsx we type check, lint, lint styles, and format
  '**/*.{ts,tsx,js,jsx}': [
    () => 'tsc',
    'eslint --cache --fix --no-eslintrc -c config/eslint.config.js',
    'prettier --loglevel warn --write',
  ],
  // Outside of the project folder or in JSON/etc we just format and call it good
  '*.{mdx,json,md,yml,css}': ['prettier --loglevel warn --write'],
};
