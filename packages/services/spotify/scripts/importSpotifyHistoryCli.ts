/**
 * Import Spotify listening history from the GDPR StreamingHistory export.
 *
 * Usage:
 *   turbo import:spotify -- ./path/to/StreamingHistory0.json
 *   turbo import:spotify -- --dry-run ./path/to/StreamingHistory*.json
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { log } from '@dg/shared-core/helpers/log';
import { serializeError } from '@dg/shared-core/helpers/serializeError';
import { importSpotifyHistory } from '../importSpotifyHistory';

type CliArgs = {
  dryRun: boolean;
  patterns: Array<string>;
};

const escapeRegex = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

const expandPattern = (pattern: string) => {
  if (!pattern.includes('*')) {
    return [pattern];
  }

  const directory = dirname(pattern);
  const baseName = basename(pattern);
  const matcher = new RegExp(`^${escapeRegex(baseName).replace('\\*', '.*')}$`);

  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && matcher.test(entry.name))
    .map((entry) => join(directory, entry.name));
};

const parseArgs = (argv: Array<string>): CliArgs => {
  const dryRun = argv.includes('--dry-run');
  const patterns = argv.filter((arg) => !arg.startsWith('--'));

  if (patterns.length === 0) {
    log.error('Usage: turbo import:spotify -- <file.json> [--dry-run]');
    log.error('  Supports glob patterns: ./export/StreamingHistory*.json');
    process.exit(1);
  }

  return { dryRun, patterns };
};

const resolveFiles = (patterns: Array<string>) =>
  Array.from(new Set(patterns.flatMap((pattern) => expandPattern(pattern))));

const readJsonFile = (filePath: string) => {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const importFile = (filePath: string, dryRun: boolean) => {
  if (!existsSync(filePath)) {
    log.error(`File not found: ${filePath}`);
    return { errors: 1, imported: 0, notFound: 0 };
  }

  log.info(`Processing: ${filePath}`);
  const entries = readJsonFile(filePath);
  return importSpotifyHistory(entries, { dryRun });
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = resolveFiles(args.patterns);

  log.info(`Found ${files.length} file(s) to import`);

  let totalImported = 0;
  let totalNotFound = 0;
  let totalErrors = 0;

  for (const file of files) {
    const result = await importFile(file, args.dryRun);
    totalImported += result.imported;
    totalNotFound += result.notFound;
    totalErrors += result.errors;
  }

  log.info('=== Import Summary ===');
  log.info(`Imported: ${totalImported}`);
  log.info(`Not found: ${totalNotFound}`);
  log.info(`Errors: ${totalErrors}`);
}

main().catch((error) => {
  log.error('Import failed', { error: serializeError(error) });
  process.exit(1);
});
