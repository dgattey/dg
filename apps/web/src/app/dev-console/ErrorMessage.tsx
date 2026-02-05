import { Typography } from '@mui/material';

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
