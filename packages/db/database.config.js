require('dotenv-mono').config();
const postgres = require('pg');

const SHARED_OPTIONS = {
  dialect: 'postgres',
  dialectModule: postgres, // gets around a Vercel bug where it's missing on edge functions
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      require: true,
    },
  },
  use_env_variable: 'DATABASE_URL',
};

module.exports = {
  development: SHARED_OPTIONS,
  production: SHARED_OPTIONS,
  test: SHARED_OPTIONS,
};
