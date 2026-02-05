import { Chip } from '@mui/material';

/**
 * Status chip showing connected/not connected state.
 */
export function StatusChip({ isConnected }: { isConnected: boolean }) {
  return (
    <Chip
      color={isConnected ? 'success' : 'default'}
      label={isConnected ? 'Connected' : 'Not connected'}
    />
  );
}
