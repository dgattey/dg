import { StickyBarTopMask } from '@dg/ui/core/StickyFadeBar';
import type { ReactNode } from 'react';
import { CollageShell } from '../../collage/CollageShell';
import { Footer } from '../../layouts/Footer';
import { Header } from '../../layouts/Header';
import { PageScrollProvider } from '../../layouts/PageScrollContext';
import { PageViewTransition } from '../../layouts/PageViewTransition';

export default function RedesignLayout({ children }: { children: ReactNode }) {
  return (
    <CollageShell>
      <PageScrollProvider>
        <Header surface="collage" />
        <StickyBarTopMask />
        <main className="collageMain">
          <PageViewTransition>{children}</PageViewTransition>
        </main>
        <Footer surface="collage" />
      </PageScrollProvider>
    </CollageShell>
  );
}
