import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Card, CardContent, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { DevConsoleCardBoundary } from './DevConsoleCardBoundary';

export function DevConsoleCardShell({
  children,
  surface = 'classic',
}: {
  children: ReactNode;
  surface?: SiteSurface;
}) {
  if (surface === 'collage') {
    return (
      <PaperCard
        className="devConsole__card"
        edge="quad-a"
        innerClassName="devConsole__cardInner"
        tiltDeg={-0.8}
      >
        <Stack className="devConsole__cardContent">
          <DevConsoleCardBoundary surface={surface}>{children}</DevConsoleCardBoundary>
        </Stack>
      </PaperCard>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack sx={{ gap: 2 }}>
          <DevConsoleCardBoundary>{children}</DevConsoleCardBoundary>
        </Stack>
      </CardContent>
    </Card>
  );
}
