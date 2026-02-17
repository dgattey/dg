import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';

/**
 * Find the repository root by looking for turbo.json
 */
export function findRoot(startDir?: string): string {
  let dir = startDir ?? dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'turbo.json'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error('Could not find repository root');
}

/**
 * Load .env file into process.env
 */
export function loadEnv(root?: string): void {
  const envFile = join(root ?? findRoot(), '.env');
  if (!existsSync(envFile)) return;

  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex);
    let value = trimmed.slice(eqIndex + 1);

    // Remove surrounding quotes and unescape
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    process.env[key] = value;
  }
}

/**
 * Create and manage spinners
 */
export function spinner(text: string): Ora {
  return ora({ color: 'cyan', text });
}

export async function withSpinner<T>(
  text: string,
  fn: (s: Ora) => T | Promise<T>,
  successText?: string,
): Promise<T> {
  const s = spinner(text).start();
  try {
    const result = await Promise.resolve(fn(s));
    s.succeed(successText ?? text);
    return result;
  } catch (error) {
    s.fail(text);
    throw error;
  }
}

/**
 * Formatted output helpers
 */
export const fmt = {
  bold: (text: string) => chalk.bold(text),
  dim: (text: string) => chalk.dim(text),
  error: (text: string) => chalk.red(`✗ ${text}`),
  info: (text: string) => chalk.blue(`ℹ ${text}`),
  success: (text: string) => chalk.green(`✓ ${text}`),
  warn: (text: string) => chalk.yellow(`⚠ ${text}`),
};

/** Print to stderr (status messages) */
export function log(msg: string): void {
  // biome-ignore lint/suspicious/noConsole: CLI stderr output
  console.error(msg);
}

/** Print to stdout (command output for piping) */
export function out(msg: string): void {
  // biome-ignore lint/suspicious/noConsole: CLI stdout output
  console.log(msg);
}

/**
 * Run a command and return output, or null on error
 */
export function exec(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

export function execSafe(cmd: string): string | null {
  try {
    return exec(cmd);
  } catch {
    return null;
  }
}

/**
 * Parse command line args: returns [command, ...args]
 */
export function parseArgs(): Array<string> {
  return process.argv.slice(2);
}

/**
 * Exit with error
 */
export function fail(msg: string): never {
  log(fmt.error(msg));
  process.exit(1);
}
