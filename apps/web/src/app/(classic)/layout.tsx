import { Section } from '@dg/ui/core/Section';
import { StickyBarTopMask } from '@dg/ui/core/StickyFadeBar';
import type { SxObject } from '@dg/ui/theme';
import Container from '@mui/material/Container';
import { type ReactNode, Suspense } from 'react';
import { Footer } from '../layouts/Footer';
import { Header } from '../layouts/Header';
import { PageScrollProvider } from '../layouts/PageScrollContext';
import { PageViewTransition } from '../layouts/PageViewTransition';

const mainSectionSx: SxObject = {
  marginTop: 16,
};

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return (
    <PageScrollProvider>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <StickyBarTopMask />
      <Section sx={mainSectionSx}>
        <Container>
          <main>
            <Suspense fallback={null}>
              <PageViewTransition>{children}</PageViewTransition>
            </Suspense>
          </main>
        </Container>
      </Section>
      <Footer />
    </PageScrollProvider>
  );
}
