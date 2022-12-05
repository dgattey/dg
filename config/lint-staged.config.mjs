import micromatch from 'micromatch';

const migrationsPath = '**/migrations/*';

const format = 'prettier --loglevel warn --write';
const lint = 'eslint --cache --fix --no-eslintrc -c config/eslint.config.js';
const lintTypes = 'tsc';

const jobs = {
  // In main project files we type check, lint, lint styles, and format
  '**/*.{js,ts,tsx}': (files) => {
    const match = micromatch.not(files, migrationsPath);
    const filteredFiles = match.join(' ');
    return [
      lintTypes, // don't need the files here
      `${lint} ${filteredFiles}`,
      `${format} ${filteredFiles}`,
    ];
  },

  // In migrations, just format
  [migrationsPath]: format,

  // In non js/ts files, just format
  '*.{js,ts,tsx,css,md,json,yml}': format,
};

export default jobs;
