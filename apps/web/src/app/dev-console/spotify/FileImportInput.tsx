'use client';

import { useRef, useState } from 'react';
import {
  importSpotifyHistoryAction,
  logImportSummaryAction,
} from '../../../services/spotify.actions';
import { ImportButton } from './ImportButton';

export type FileResult = {
  fileName: string;
  imported: number;
  skipped: number;
  errors: number;
  error?: string;
  failedTrackIds: Array<string>;
};

type FileImportInputProps = {
  dryRun: boolean;
  onComplete: (results: Array<FileResult>) => void;
};

/**
 * Each Spotify GDPR entry has ~20 fields but we only use 3. Extracting them
 * client-side keeps chunk payloads small enough for server action limits.
 */
const ENTRIES_PER_CHUNK = 2000;

function extractEntries(
  rawEntries: Array<Record<string, unknown>>,
): Array<{ ms_played: unknown; spotify_track_uri: unknown; ts: unknown }> {
  return rawEntries.map((entry) => ({
    ms_played: entry.ms_played,
    spotify_track_uri: entry.spotify_track_uri ?? null,
    ts: entry.ts,
  }));
}

async function processFile(file: File, dryRun: boolean): Promise<FileResult> {
  try {
    const text = await file.text();
    const rawEntries: unknown = JSON.parse(text);

    if (!Array.isArray(rawEntries)) {
      return {
        error: 'File does not contain a JSON array',
        errors: 0,
        failedTrackIds: [],
        fileName: file.name,
        imported: 0,
        skipped: 0,
      };
    }

    const entries = extractEntries(rawEntries);
    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let firstError: string | undefined;
    const failedTrackIds: Array<string> = [];

    for (let i = 0; i < entries.length; i += ENTRIES_PER_CHUNK) {
      const chunk = entries.slice(i, i + ENTRIES_PER_CHUNK);
      const result = await importSpotifyHistoryAction(JSON.stringify(chunk), { dryRun });

      if (result.success) {
        totalImported += result.imported ?? 0;
        totalSkipped += result.skipped ?? 0;
        totalErrors += result.errors ?? 0;
        failedTrackIds.push(...(result.failedTrackIds ?? []));
      } else {
        firstError ??= result.error ?? 'Import failed';
        totalErrors += chunk.length;
      }
    }

    return {
      error: firstError,
      errors: totalErrors,
      failedTrackIds,
      fileName: file.name,
      imported: totalImported,
      skipped: totalSkipped,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to process file',
      errors: 0,
      failedTrackIds: [],
      fileName: file.name,
      imported: 0,
      skipped: 0,
    };
  }
}

/**
 * Hidden file input with processing logic. Manages its own progress state.
 */
export function FileImportInput({ dryRun, onComplete }: FileImportInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const isProcessing = progress.current > 0 && progress.current <= progress.total;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setProgress({ current: 1, total: files.length });

    const results: Array<FileResult> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        setProgress({ current: i + 1, total: files.length });
        results.push(await processFile(file, dryRun));
      }
    }

    setProgress({ current: 0, total: 0 });
    await logImportSummaryAction(results, dryRun);
    onComplete(results);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        accept=".json"
        multiple
        onChange={handleChange}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />
      <ImportButton
        currentFile={progress.current}
        isProcessing={isProcessing}
        onClick={() => inputRef.current?.click()}
        totalFiles={progress.total}
      />
    </>
  );
}
