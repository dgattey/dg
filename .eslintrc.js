const BASE_EXTENSIONS = ['airbnb', 'airbnb/hooks', 'prettier', 'plugin:@next/next/recommended'];

const TYPESCRIPT_EXTENSIONS = [
  ...BASE_EXTENSIONS,
  'airbnb-typescript',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
];

const BASE_PLUGINS = ['react'];

const TYPESCRIPT_PLUGINS = [...BASE_PLUGINS, '@typescript-eslint'];

const BASE_RULES = {
  // We want to enable prop spreading (i.e. <Component {...props} />) since it allows us to easily pass props to child components
  'react/jsx-props-no-spreading': 'off',
  // Always prefer arrow functions for component definitions
  'react/function-component-definition': [
    'error',
    {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function',
    },
  ],
};

const TYPESCRIPT_RULES = {
  ...BASE_RULES,
  // The typescript version of no-return-await takes over to add a few okay cases
  'no-return-await': 'off',
  // This needs to be turned on to take over from `no-return-await`
  '@typescript-eslint/return-await': 'error',
  // There's a rule against floating promises, but React can't have
  // useEffect be async. We get around it with an immediately invoked function (a void function)
  '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
  // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/restrict-template-expressions.md
  '@typescript-eslint/restrict-template-expressions': 'off',
  // Type assertions (const x: Type = y as Type) create bugs and mask errors, don't allow them at all
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: BASE_EXTENSIONS,
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: BASE_PLUGINS,
  globals: {
    React: 'readable',
  },
  reportUnusedDisableDirectives: true,
  rules: BASE_RULES,
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],

      extends: TYPESCRIPT_EXTENSIONS,
      plugins: TYPESCRIPT_PLUGINS,
      settings: {
        'import/resolver': {
          typescript: {},
        },
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
      rules: TYPESCRIPT_RULES,
    },
  ],
};