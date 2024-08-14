/** @type {import('eslint').Linter.Config['rules']} */
const rules = {
  // Incorrectly makes me kebab case and my naming is intentional
  'unicorn/filename-case': 'off',
  // Too much hassle/overhead with these on
  '@typescript-eslint/explicit-function-return-type': 'off',
  'eslint-comments/require-description': 'off',
  // Arrays should always be the generic kind
  '@typescript-eslint/array-type': ['error', { default: 'generic' }],
  // The typescript version of no-return-await takes over to add a few okay cases
  'no-return-await': 'off',
  // This needs to be turned on to take over from `no-return-await`
  '@typescript-eslint/return-await': 'error',
  // There's a rule against floating promises, but React can't have
  // useEffect be async. We get around it with an immediately invoked function (a void function)
  '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
  // https://typescript-eslint.io/rules/restrict-template-expressions/
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    {
      allowNumber: true,
    },
  ],
  // Type assertions (const x: Type = y as Type) create bugs and mask errors, don't allow them at all
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
  // We always want types since we run into errors with interfaces and type guards otherwise
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
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

/** @type {import('eslint').Linter.Config['rules']} */
const reactRules = {
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
  // In Typescript, default props are supported as default arguments
  'react/require-default-props': 'off',
};

module.exports = {
  reactRules,
  rules,
};
