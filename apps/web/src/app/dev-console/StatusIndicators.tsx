import { Typography } from '@dg/ui/core/Typography';
import { PaperTag } from '../collage/PaperTag';

/**
 * Status chip showing connected/not connected state.
 */
export function StatusChip({ isConnected }: { isConnected: boolean }) {
  return (
    <PaperTag
      className="collageStatusTag"
      tiltDeg={isConnected ? -2 : 2}
      tone={isConnected ? 'leaf' : 'vermilion'}
      variant="meta"
    >
      {isConnected ? 'Connected' : 'Not connected'}
    </PaperTag>
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
    <Typography className="devConsole__errorText" variant="row-title">
      {message}
    </Typography>
  );
}
