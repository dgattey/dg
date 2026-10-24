import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from '@dg/shared-core/logging/log';
import 'dotenv-mono/load';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(packageRoot, 'migrations');
const stampPath = join(packageRoot, '.turbo', 'migrate-stamp.txt');

export function computeMigrationStamp(): string | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return null;
  }
  const hash = createHash('sha256').update(dbUrl).update('\0');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();
  for (const file of files) {
    hash
      .update(file)
      .update('\0')
      .update(readFileSync(join(migrationsDir, file)))
      .update('\0');
  }
  return hash.digest('hex');
}

const currentStamp = computeMigrationStamp();

if (currentStamp && existsSync(stampPath) && readFileSync(stampPath, 'utf8') === currentStamp) {
  log.info('Database migrations up to date; skipping db:migrate');
  process.exit(0);
}

log.info('Running database migrations...');
try {
  execSync('pnpm exec sequelize-cli db:migrate', {
    env: { ...process.env, NODE_OPTIONS: '--import tsx' },
    stdio: 'pipe',
  });
  if (currentStamp) {
    mkdirSync(dirname(stampPath), { recursive: true });
    writeFileSync(stampPath, currentStamp, 'utf8');
  }
} catch (error) {
  const stderr =
    error && typeof error === 'object' && 'stderr' in error && Buffer.isBuffer(error.stderr)
      ? error.stderr.toString('utf8')
      : '';
  const stdout =
    error && typeof error === 'object' && 'stdout' in error && Buffer.isBuffer(error.stdout)
      ? error.stdout.toString('utf8')
      : '';
  const combined = `${stdout}\n${stderr}\n${error instanceof Error ? error.message : String(error)}`;
  if (
    /transfer|allowance|quota|exceeded|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ConnectionError|ConnectionRefused|timeout|terminating connection/i.test(
      combined,
    )
  ) {
    log.warn('Database unreachable during db:migrate; continuing without running migrations', {
      reason: combined.trim().slice(0, 500),
    });
    process.exit(0);
  }
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  throw error;
}
