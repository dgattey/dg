import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log } from '@dg/shared-core/logging/log';
import 'dotenv-mono/load';

const vercelEnv = process.env.VERCEL_ENV;
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(packageRoot, 'migrations');
const stampPath = join(packageRoot, '.turbo', 'migrate-stamp.txt');

function computeMigrationStamp(): string | null {
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

const useStampCache = vercelEnv !== 'production';
const currentStamp = useStampCache ? computeMigrationStamp() : null;

if (currentStamp && existsSync(stampPath) && readFileSync(stampPath, 'utf8') === currentStamp) {
  log.info('Database migrations up to date; skipping db:migrate');
  process.exit(0);
}

log.info('Running database migrations...');
execSync('pnpm exec sequelize-cli db:migrate', {
  env: { ...process.env, NODE_OPTIONS: '--import tsx' },
  stdio: 'inherit',
});

if (currentStamp) {
  mkdirSync(dirname(stampPath), { recursive: true });
  writeFileSync(stampPath, currentStamp, 'utf8');
}
