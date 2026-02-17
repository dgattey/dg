#!/usr/bin/env tsx
/**
 * Generate .env file from 1Password secrets
 * Usage: tsx src/env.ts [--force]
 */
import { exec, execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { fail, findRoot, fmt, log, out, spinner, withSpinner } from './lib/utils.js';

const execAsync = promisify(exec);

const root = findRoot();
const envFile = join(root, '.env');
const keysFile = join(root, 'config', 'env.secrets.keys');
const force = process.argv.includes('--force') || process.argv.includes('-f');

// Check 1Password CLI
try {
  execSync('command -v op', { stdio: 'ignore' });
} catch {
  log(fmt.warn('1Password CLI not found, skipping .env generation'));
  process.exit(0);
}

// Read keys
const keys = readFileSync(keysFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

if (keys.length === 0) fail(`No keys found in ${keysFile}`);

// Check if regeneration needed
if (!force && existsSync(envFile)) {
  const existing = readFileSync(envFile, 'utf8')
    .split('\n')
    .filter((l) => !l.startsWith('#') && l.includes('='))
    .map((l) => l.split('=')[0])
    .filter(Boolean)
    .sort()
    .join('\n');

  if (existing === [...keys].sort().join('\n')) {
    log(fmt.success('.env already exists with correct keys'));
    process.exit(0);
  }
  log(fmt.info('.env keys mismatch, regenerating...'));
}

if (existsSync(envFile)) rmSync(envFile);

// Ensure 1Password auth
process.env.OP_ACCOUNT = 'my.1password.com';
try {
  execSync('op whoami', { stdio: 'ignore' });
} catch {
  const s = spinner('Signing in to 1Password...').start();
  try {
    execSync('op signin --account "my.1password.com"', { stdio: 'inherit' });
    s.succeed('Signed in to 1Password');
  } catch {
    s.fail('1Password sign-in failed');
    fail('Enable: 1Password > Settings > Developer > Integrate with 1Password CLI');
  }
}

// Fetch secrets in parallel
const secrets = await withSpinner('Fetching secrets from 1Password', async (s) => {
  const results: Record<string, string> = {};
  const missing: Array<string> = [];

  // Fetch all keys in parallel
  await Promise.all(
    keys.map(async (key) => {
      try {
        const { stdout } = await execAsync(`op read "op://dg/${key}/value"`);
        results[key] = stdout.trim();
      } catch {
        missing.push(key);
      }
    }),
  );

  s.text = `Fetched ${Object.keys(results).length}/${keys.length} secrets`;

  if (missing.length > 0) {
    throw new Error(
      `Keys not found in 1Password vault 'dg':\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nAdd each as an item with value in 'value' field`,
    );
  }
  return results;
});

// Write .env
const content = keys
  .map((key) => {
    let v = secrets[key] ?? '';
    v = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `${key}="${v}"`;
  })
  .join('\n');

writeFileSync(envFile, `${content}\n`, 'utf8');
out(fmt.success('Generated .env'));
