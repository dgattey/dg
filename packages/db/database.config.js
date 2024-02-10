require('dotenv-mono').config({
  override: true,
});

const SHARED_OPTIONS = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'mysql',
};

module.exports = {
  development: SHARED_OPTIONS,
  test: SHARED_OPTIONS,
  production: SHARED_OPTIONS,
};
