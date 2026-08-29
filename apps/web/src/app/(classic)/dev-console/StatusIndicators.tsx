import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Chip, Typography } from '@mui/material';
import { StatusTag } from '../../collage/StatusTag';
import styles from './StatusIndicators.module.css';

/**
 * Status chip showing connected/not connected state.
 */
export function StatusChip({
  isConnected,
  surface = 'classic',
}: {
  isConnected: boolean;
  surface?: SiteSurface;
}) {
  if (surface === 'collage') {
    return <StatusTag isConnected={isConnected} />;
  }

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
export function ErrorMessage({
  message,
  surface = 'classic',
}: {
  message: string | null;
  surface?: SiteSurface;
}) {
  if (!message) {
    return null;
  }
  return (
    <Typography
      className={surface === 'collage' ? styles.collageError : undefined}
      color={surface === 'collage' ? undefined : 'error'}
      variant="body2"
    >
      {message}
    </Typography>
  );
}
