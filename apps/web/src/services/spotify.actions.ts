'use server';

import { importSpotifyHistory } from '@dg/services/spotify/importSpotifyHistory';
import { log } from '@dg/shared-core/logging/log';
import { withDevConsoleAuth } from './devConsoleAuth';

type ImportActionResult = {
  success: boolean;
  error?: string;
  imported?: number;
  skipped?: number;
  errors?: number;
  failedTrackIds?: Array<string>;
};

/**
 * Server Action to import Spotify listening history from a GDPR export file.
 * Requires dev console authentication.
 *
 * @param fileText - Raw JSON text from a StreamingHistory file
 * @param options - Import options (dryRun)
 * @returns Import statistics or error
 */
export async function importSpotifyHistoryAction(
  fileText: string,
  options: { dryRun: boolean },
): Promise<ImportActionResult> {
  return await withDevConsoleAuth(async () => {
    try {
      const result = await importSpotifyHistory(fileText, options);
      return { success: true, ...result };
    } catch (error) {
      log.error('Failed to import Spotify history', { error });
      const message = error instanceof Error ? error.message : 'Import failed';
      return { error: message, success: false };
    }
  });
}

type FileResultSummary = {
  fileName: string;
  imported: number;
  skipped: number;
  errors: number;
  error?: string;
  failedTrackIds: Array<string>;
};

/**
 * Server Action to log a final summary after all files/chunks have been processed.
 * Called once by the client when the entire import session is complete.
 */
export async function logImportSummaryAction(
  results: Array<FileResultSummary>,
  dryRun: boolean,
): Promise<ImportActionResult> {
  return await withDevConsoleAuth(() => {
    const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    const failedFiles = results.filter((r) => r.error);
    const allFailedTrackIds = [...new Set(results.flatMap((r) => r.failedTrackIds))];

    log.info('=== SPOTIFY IMPORT SESSION COMPLETE ===', {
      dryRun,
      filesProcessed: results.length,
      totalErrors,
      totalImported,
      totalSkipped,
      ...(failedFiles.length > 0 && {
        failedFiles: failedFiles.map((f) => ({ error: f.error, fileName: f.fileName })),
      }),
      ...(allFailedTrackIds.length > 0 && { failedTrackIds: allFailedTrackIds }),
    });

    return { success: true };
  });
}
