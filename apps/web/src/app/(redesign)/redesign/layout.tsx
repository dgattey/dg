import type { ReactNode } from 'react';
import '../../collage/collage.css';
import '../../collage/chrome.css';
import { familjen } from '../../collage/familjen';
import { Footer } from '../../layouts/Footer';
import { Header } from '../../layouts/Header';
import { PageScrollProvider } from '../../layouts/PageScrollContext';
import { PageViewTransition } from '../../layouts/PageViewTransition';
import { NowPlayingProvider } from '../../spotify/NowPlayingContext';

export default function RedesignLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`collageRoot ${familjen.variable}`}>
      <PageScrollProvider>
        <NowPlayingProvider>
          <Header surface="collage" />
          <main className="collageMain">
            <PageViewTransition>{children}</PageViewTransition>
          </main>
        </NowPlayingProvider>
        <Footer surface="collage" />
      </PageScrollProvider>
    </div>
  );
}
