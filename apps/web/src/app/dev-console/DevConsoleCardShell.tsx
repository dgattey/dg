import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { DevConsoleCardBoundary } from './DevConsoleCardBoundary';

export function DevConsoleCardShell({ children }: { children: ReactNode }) {
  return (
    <PaperCard
      className="devConsole__card"
      edge="quad-a"
      innerClassName="devConsole__cardInner"
      tiltDeg={-0.8}
    >
      <div className="devConsole__cardContent">
        <DevConsoleCardBoundary>{children}</DevConsoleCardBoundary>
      </div>
    </PaperCard>
  );
}
