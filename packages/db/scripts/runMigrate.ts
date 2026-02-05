/**
 * Wrapper script for running Sequelize migrations.
 * Skips migrations on Vercel preview builds to avoid touching production DB.
 */
import { execSync } from 'node:child_process';

const vercelEnv = process.env.VERCEL_ENV;

if (vercelEnv === 'preview') {
  // biome-ignore lint/suspicious/noConsole: CLI script output
  console.log('Skipping migrations on Vercel preview build');
  process.exit(0);
}

// biome-ignore lint/suspicious/noConsole: CLI script output
console.log('Running database migrations...');
execSync('pnpm exec sequelize-cli db:migrate', {
  env: { ...process.env, NODE_OPTIONS: '--import tsx' },
  stdio: 'inherit',
});
