require('dotenv-mono').config();
const postgres = require('pg');

const SHARED_OPTIONS = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  dialectModule: postgres, // gets around a Vercel bug where it's missing on edge functions
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: SHARED_OPTIONS,
  test: SHARED_OPTIONS,
  production: SHARED_OPTIONS,
};
