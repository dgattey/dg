import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Chip, Typography } from '@mui/material';
import { PaperTag } from '../../collage/PaperTag';
import styles from './devConsole.module.css';

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
      className={surface === 'collage' ? styles.errorText : undefined}
      color={surface === 'collage' ? undefined : 'error'}
      variant="body2"
    >
      {message}
    </Typography>
  );
}
