const BASE_EXTENSIONS = ['airbnb', 'airbnb/hooks', 'prettier', 'next', 'plugin:dg/all'];

const TYPESCRIPT_EXTENSIONS = [
  ...BASE_EXTENSIONS,
  'airbnb-typescript',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
];

const BASE_PLUGINS = ['react'];

const BASE_RULES = {
  // We want to enable prop spreading (i.e. <Component {...props} />) since it allows us to easily pass props to child components
  'react/jsx-props-no-spreading': 'off',
  // Never prefer arrow functions for named component definitions
  'react/function-component-definition': [
    'error',
    {
      namedComponents: 'function-declaration',
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
  '@typescript-eslint/restrict-template-expressions': 'error',
  // Type assertions (const x: Type = y as Type) create bugs and mask errors, don't allow them at all
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
  // In Typescript, default props are supported as default arguments
  'react/require-default-props': 'off',
  // There's a typescript option `noFallthroughCasesInSwitch` that's more robust and allows for union types to have no default fallthrough. Preferred!
  'default-case': 'off',
  // Typescript makes this obsolete, as it'll warn if there's a value returned that's
  // not what's expected or vice versa
  'consistent-return': 'off',
  // This is broken
  '@typescript-eslint/indent': 'off',
  // Default exports aren't good for renaming and not really all that useful anyway
  'import/prefer-default-export': 'off',
  // No duplicate modules in the same file
  'import/no-duplicates': 'error',
  // Nothing relative outside imports
  'import/no-relative-packages': 'error',
  // Nothing extra, outside what's defined in the package.json
  'import/no-extraneous-dependencies': 'error',
  // Condenses extra path segments automatically!
  'import/no-useless-path-segments': [
    'error',
    {
      noUselessIndex: true,
    },
  ],
  // I don't care about this - I only ever nest two levels deep
  'no-nested-ternary': 'off',
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: '@mui/material',
          importNames: ['Link'],
          message: 'Please use the local version of Link instead.',
        },
        {
          name: 'next/link',
          message: 'Please use the local version of Link instead.',
        },
      ],
    },
  ],
};

const TYPESCRIPT_OVERRIDE = {
  files: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts'],
  extends: TYPESCRIPT_EXTENSIONS,
  plugins: [...BASE_PLUGINS, '@typescript-eslint'],
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
};

// Scripts allow console logging
const SCRIPTS_OVERRIDE = {
  ...TYPESCRIPT_OVERRIDE,
  files: ['scripts/**/*.ts'],
  rules: {
    ...TYPESCRIPT_RULES,
    // Console logging allowed
    'no-console': 'off',
    // Default exports are actually required for scripts
    'import/prefer-default-export': 'error',
  },
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
  overrides: [TYPESCRIPT_OVERRIDE, SCRIPTS_OVERRIDE],
  ignorePatterns: [
    '.cache/',
    '.next/',
    '.vscode/',
    '.vercel/',
    '.turbo/',
    'node_modules/',
    '**/*.generated.*',
    '**/generated/*',
    'migrations/',
  ],
};
