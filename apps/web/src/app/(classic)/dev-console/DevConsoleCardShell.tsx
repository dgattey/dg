import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Card, CardContent, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { DevConsoleCardBoundary } from './DevConsoleCardBoundary';
import styles from './devConsole.module.css';

type DevConsoleCardShellProps = {
  children: ReactNode;
  surface?: SiteSurface;
};

export function DevConsoleCardShell({ children, surface = 'classic' }: DevConsoleCardShellProps) {
  if (surface === 'collage') {
    return (
      <PaperCard
        className={styles.card}
        edge="quad-a"
        innerClassName={styles.cardInner}
        tiltDeg={-0.8}
      >
        <Stack className={styles.cardContent}>
          <DevConsoleCardBoundary surface={surface}>{children}</DevConsoleCardBoundary>
        </Stack>
      </PaperCard>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack
          sx={{
            gap: 2,
          }}
        >
          <DevConsoleCardBoundary>{children}</DevConsoleCardBoundary>
        </Stack>
      </CardContent>
    </Card>
  );
}
