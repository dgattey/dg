/**
 * Imports Spotify Extended Streaming History or Account Data `.zip`, directory, or `.json` files
 * into the `"SpotifyPlay"` table idempotently (`ON CONFLICT DO NOTHING`).
 *
 * Usage:
 *   pnpm exec turbo spotify:import -- <path.zip | dir | file.json ...> [--dry-run] [--from=YYYY-MM-DD] [--to=YYYY-MM-DD] [--min-ms=0]
 */
import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { closeDbConnection } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import {
  type ImportSpotifyHistoryOptions,
  importSpotifyHistoryEntries,
} from '../spotify/importSpotifyHistory';
import {
  extractZipJsonFiles,
  mergeParsedHistories,
  type ParsedStreamingHistory,
  parseExtendedStreamingHistory,
} from '../spotify/parseSpotifyHistoryExport';

type CliArgs = {
  options: ImportSpotifyHistoryOptions;
  paths: Array<string>;
};

type LoadedJsonFile = {
  fileName: string;
  fromArchiveOrDir: boolean;
  text: string;
};

function parseDateArg(flag: string, value: string): Date {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T${flag === '--to' ? '23:59:59.999Z' : '00:00:00.000Z'}`
    : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date for ${flag}: "${value}"`);
  }
  return date;
}

function parseCliArgs(argv: ReadonlyArray<string>): CliArgs {
  const options: ImportSpotifyHistoryOptions = {};
  const paths: Array<string> = [];

  for (const arg of argv) {
    if (arg === '--') {
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--from=')) {
      options.from = parseDateArg('--from', arg.slice('--from='.length));
    } else if (arg.startsWith('--to=')) {
      options.to = parseDateArg('--to', arg.slice('--to='.length));
    } else if (arg.startsWith('--min-ms=')) {
      const ms = Number(arg.slice('--min-ms='.length));
      if (!Number.isFinite(ms) || ms < 0) {
        throw new Error(`Invalid --min-ms value: "${arg}"`);
      }
      options.minMsPlayed = ms;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown flag "${arg}"`);
    } else {
      paths.push(arg);
    }
  }

  return { options, paths };
}

function loadJsonInputs(targetPath: string): Array<LoadedJsonFile> {
  const resolved = path.resolve(targetPath);
  const stat = fs.statSync(resolved);

  if (stat.isDirectory()) {
    return fs
      .readdirSync(resolved)
      .filter((name) => name.endsWith('.json') && !name.startsWith('._'))
      .sort()
      .map((name) => ({
        fileName: path.join(resolved, name),
        fromArchiveOrDir: true,
        text: fs.readFileSync(path.join(resolved, name), 'utf8'),
      }));
  }

  if (resolved.toLowerCase().endsWith('.zip')) {
    return extractZipJsonFiles(fs.readFileSync(resolved)).map((entry) => ({
      ...entry,
      fromArchiveOrDir: true,
    }));
  }

  return [
    {
      fileName: path.basename(resolved),
      fromArchiveOrDir: false,
      text: fs.readFileSync(resolved, 'utf8'),
    },
  ];
}

const { options, paths } = parseCliArgs(process.argv.slice(2));
if (paths.length === 0) {
  log.error(
    'Usage: turbo spotify:import -- <path.zip | dir | file.json ...> [--dry-run] [--from=YYYY-MM-DD] [--to=YYYY-MM-DD] [--min-ms=0]',
  );
  process.exit(1);
}

const files = paths.flatMap(loadJsonInputs);
if (files.length === 0) {
  log.error('No JSON files found in provided path(s)', { paths });
  process.exit(1);
}

const parsedFiles: Array<ParsedStreamingHistory> = [];
for (const { fileName, fromArchiveOrDir, text } of files) {
  try {
    const parsed = parseExtendedStreamingHistory(text, options);
    log.info(`Parsed ${fileName}`, {
      musicEntries: parsed.entries.length,
      skippedNonMusic: parsed.skippedNonMusic,
      skippedOutOfRange: parsed.skippedOutOfRange,
      totalEntries: parsed.totalEntries,
    });
    parsedFiles.push(parsed);
  } catch (error) {
    if (fromArchiveOrDir) {
      log.info(`Skipping non-streaming-history JSON file ${fileName}`);
      continue;
    }
    throw error;
  }
}

const merged = mergeParsedHistories(parsedFiles);
const outcome = await importSpotifyHistoryEntries(merged, options);
await closeDbConnection();

log.info('Spotify history import finished', {
  ...outcome,
  dryRun: Boolean(options.dryRun),
  filesProcessed: parsedFiles.length,
});
process.exit(outcome.failedTrackIds.length > 0 && outcome.imported === 0 ? 1 : 0);
