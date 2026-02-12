'use client';

import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import type { FileResult } from './FileImportInput';
import { FileImportInput } from './FileImportInput';
import { ImportResults } from './ImportResults';

/**
 * Imports Spotify listening history from GDPR export files.
 */
export function SpotifyImportCard() {
  const [dryRun, setDryRun] = useState(false);
  const [results, setResults] = useState<Array<FileResult>>([]);

  return (
    <DevConsoleCardShell>
      <Typography variant="h3">Spotify history import</Typography>

      <Stack gap={2}>
        <Stack alignItems="center" direction="row" gap={2}>
          <FileImportInput dryRun={dryRun} onComplete={setResults} />
          <FormControlLabel
            control={<Checkbox checked={dryRun} onChange={() => setDryRun(!dryRun)} />}
            label="Dry run"
          />
        </Stack>

        <ImportResults dryRun={dryRun} results={results} />
      </Stack>
    </DevConsoleCardShell>
  );
}
