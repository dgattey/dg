/**
 * Wrapper script for running Sequelize migrations.
 * Skips migrations on Vercel preview builds to avoid touching production DB.
 */
import { execSync } from 'node:child_process';
import { log } from '@dg/shared-core/logging/log';

const vercelEnv = process.env.VERCEL_ENV;

if (vercelEnv === 'preview') {
  log.info('Skipping migrations on Vercel preview build');
  process.exit(0);
}

log.info('Running database migrations...');
execSync('pnpm exec sequelize-cli db:migrate', {
  env: { ...process.env, NODE_OPTIONS: '--import tsx' },
  stdio: 'inherit',
});
