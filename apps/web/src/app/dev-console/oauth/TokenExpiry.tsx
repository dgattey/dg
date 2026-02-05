import { Typography } from '@mui/material';

export function TokenExpiry({ expiresAt }: { expiresAt: Date | null }) {
  if (!expiresAt) {
    return null;
  }
  return (
    <Typography color="text.secondary" variant="body2">
      Access token expires at {expiresAt.toLocaleString()}
    </Typography>
  );
}
