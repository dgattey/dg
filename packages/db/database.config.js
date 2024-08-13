require('dotenv-mono').config();

const SHARED_OPTIONS = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
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
