import type { ReactNode } from 'react';
import './collage.css';
import { familjen } from './familjen';

export function CollageShell({ children }: { children: ReactNode }) {
  return <div className={`collageRoot ${familjen.variable}`}>{children}</div>;
}
