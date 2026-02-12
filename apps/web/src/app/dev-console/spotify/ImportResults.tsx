'use client';

import { Alert, Box, Stack, Typography } from '@mui/material';
import type { FileResult } from './FileImportInput';

type ImportResultsProps = {
  results: Array<FileResult>;
  dryRun: boolean;
};

export function ImportResults({ results, dryRun }: ImportResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const failedFiles = results.filter((r) => r.error);

  return (
    <Stack gap={1}>
      <Alert severity={dryRun ? 'info' : 'success'}>
        {dryRun ? 'Dry run complete: would import' : 'Imported'} {totalImported.toLocaleString()}{' '}
        plays ({totalSkipped.toLocaleString()} skipped, {totalErrors.toLocaleString()} errors)
      </Alert>

      {failedFiles.length > 0 && (
        <Alert severity="error">
          {failedFiles.length} file(s) failed:
          <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
            {failedFiles.map((f) => (
              <li key={f.fileName}>
                {f.fileName}: {f.error}
              </li>
            ))}
          </Box>
        </Alert>
      )}

      <Typography color="text.secondary" variant="body2">
        Previously imported entries are automatically skipped. Safe to re-run.
      </Typography>
    </Stack>
  );
}
