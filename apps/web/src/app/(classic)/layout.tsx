import { Container } from '@dg/ui/core/Container';
import { Section } from '@dg/ui/core/Section';
import { StickyBarTopMask } from '@dg/ui/core/StickyFadeBar';
import type { SxObject } from '@dg/ui/theme';
import type { ReactNode } from 'react';
import { Footer } from '../layouts/Footer';
import { Header } from '../layouts/Header';
import { PageViewTransition } from '../layouts/PageViewTransition';
import { NowPlayingProvider } from '../spotify/NowPlayingContext';

const mainSectionSx: SxObject = {
  marginTop: 16,
};

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NowPlayingProvider>
        <Header />
        {/* Covers the strip above a pinned bar, on pages that have one */}
        <StickyBarTopMask />
        {/* Contained main content with consistent section spacing */}
        <Section sx={mainSectionSx}>
          <Container>
            <main>
              <PageViewTransition>{children}</PageViewTransition>
            </main>
          </Container>
        </Section>
      </NowPlayingProvider>
      <Footer />
    </>
  );
}
