import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Chip, Typography } from '@mui/material';
import { PaperTag } from '../../collage/PaperTag';

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
    return (
      <PaperTag
        className="collageStatusTag"
        tiltDeg={isConnected ? -2 : 2}
        tone={isConnected ? 'leaf' : 'vermilion'}
      >
        {isConnected ? 'Connected' : 'Not connected'}
      </PaperTag>
    );
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
      className={surface === 'collage' ? 'devConsole__errorText' : undefined}
      color={surface === 'collage' ? undefined : 'error'}
      variant="body2"
    >
      {message}
    </Typography>
  );
}
