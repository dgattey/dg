module.exports = {
  // In the project folder we type check, lint, lint styles, and format
  'src/**/*.{ts,tsx,js,jsx}': [
    () => 'tsc',
    'eslint --cache --fix --plugin tsc --rule \'tsc/config: [2, {configFile: "./tsconfig.json"}]\' ',
    'stylelint --fix',
    'prettier --write',
  ],
  // Outside of the project folder or in JSON/etc we just format and call it good
  '*.{ts,tsx,mdx,js,jsx,json,md,yml,css}': ['prettier --write'],
};
