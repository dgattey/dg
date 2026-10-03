import { StickyBarTopMask } from '@dg/ui/core/StickyFadeBar';
import { type ReactNode, Suspense } from 'react';
import '../../collage/collage.css';
import { familjen } from '../../collage/familjen';
import { Footer } from '../../layouts/Footer';
import { Header } from '../../layouts/Header';
import { PageScrollProvider } from '../../layouts/PageScrollContext';
import { PageViewTransition } from '../../layouts/PageViewTransition';

export default function RedesignLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`collageRoot ${familjen.variable}`}>
      <PageScrollProvider>
        <Suspense fallback={null}>
          <Header surface="collage" />
        </Suspense>
        <StickyBarTopMask surface="collage" />
        <main className="collageMain">
          <Suspense fallback={null}>
            <PageViewTransition>{children}</PageViewTransition>
          </Suspense>
        </main>
        <Footer surface="collage" />
      </PageScrollProvider>
    </div>
  );
}
