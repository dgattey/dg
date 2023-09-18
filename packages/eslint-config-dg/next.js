const { resolve } = require('node:path');
const { rules } = require('./common');

const project = resolve(process.cwd(), 'tsconfig.json');

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/browser',
    '@vercel/style-guide/eslint/typescript',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/next',
    'eslint-config-turbo',
  ].map((importPath) => require.resolve(importPath)),
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  reportUnusedDisableDirectives: true,
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.eslintrc.js',
    '.cache/',
    '.next/',
    '.vscode/',
    '.vercel/',
    '.turbo/',
    '**/*.generated.*',
    '**/generated/*',
    'migrations/',
  ],
  rules,
  overrides: [
    {
      files: ['src/pages/**/*'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
