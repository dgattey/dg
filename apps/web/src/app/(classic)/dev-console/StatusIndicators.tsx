import { Chip, Typography } from '@mui/material';

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

/**
 * Displays an error message.
 */
export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <Typography color="error" variant="body2">
      {message}
    </Typography>
  );
}
