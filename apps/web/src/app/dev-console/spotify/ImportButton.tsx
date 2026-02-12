'use client';

import { Button, CircularProgress } from '@mui/material';

type ImportButtonProps = {
  isProcessing: boolean;
  currentFile: number;
  totalFiles: number;
  onClick: () => void;
};

export function ImportButton({
  isProcessing,
  currentFile,
  totalFiles,
  onClick,
}: ImportButtonProps) {
  const label = isProcessing
    ? `Processing file ${currentFile} of ${totalFiles}...`
    : 'Select files';

  return (
    <Button
      disabled={isProcessing}
      onClick={onClick}
      size="medium"
      startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
      variant="contained"
    >
      {label}
    </Button>
  );
}
