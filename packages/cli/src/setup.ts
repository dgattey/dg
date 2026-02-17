#!/usr/bin/env tsx
/**
 * Post-install setup: direnv config, Turbo remote caching
 * Usage: tsx src/setup.ts
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { findRoot, fmt, loadEnv, log, out } from './lib/utils.js';

const root = findRoot();

// Create .envrc for direnv if missing
const envrcPath = join(root, '.envrc');
if (!existsSync(envrcPath)) {
  writeFileSync(envrcPath, 'dotenv\n', 'utf8');
  out(fmt.success('Created .envrc for direnv'));
} else {
  log(fmt.dim('.envrc already exists'));
}

// Configure Turbo remote caching
const turboConfigPath = join(root, '.turbo', 'config.json');
if (!existsSync(turboConfigPath)) {
  // Load .env to get TURBO_TEAM
  loadEnv(root);
  const turboTeam = process.env.TURBO_TEAM;

  if (turboTeam) {
    mkdirSync(join(root, '.turbo'), { recursive: true });
    writeFileSync(turboConfigPath, `${JSON.stringify({ teamId: turboTeam }, null, 2)}\n`, 'utf8');
    out(fmt.success(`Configured Turbo remote caching for team: ${turboTeam}`));
  } else {
    log(fmt.warn('TURBO_TEAM not set, skipping Turbo remote cache config'));
  }
} else {
  log(fmt.dim('Turbo config already exists'));
}

out(fmt.success('Setup complete'));
