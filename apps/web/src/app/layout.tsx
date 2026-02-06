import '@dg/ui/theme/classNameSetupOnImport';

import { Section } from '@dg/ui/core/Section';
import { SpotifyScrollProvider } from '@dg/ui/core/SpotifyHeaderContext';
import type { SxObject } from '@dg/ui/theme';
import { themePreferenceAttribute, themeSelectorAttribute } from '@dg/ui/theme';
import { GlobalStyleProvider } from '@dg/ui/theme/GlobalStyleProvider';
import { InitColorSchemeScript } from '@mui/material';
import Container from '@mui/material/Container';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { type ReactNode, Suspense } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { RefreshOnFocusProvider } from '../components/layouts/RefreshOnFocusProvider';
import { baseMetadata, viewport } from './metadata';

export const metadata: Metadata = baseMetadata;
export { viewport };

const mainSectionSx: SxObject = {
  marginTop: 16,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const htmlAttributes = {
    [themePreferenceAttribute]: 'system',
  };
  return (
    <html lang="en" suppressHydrationWarning={true} {...htmlAttributes}>
      <body>
        <InitColorSchemeScript attribute={themeSelectorAttribute} defaultMode="system" />
        <AppRouterCacheProvider>
          <GlobalStyleProvider>
            {/* Refresh RSC data on focus or navigation */}
            <Suspense fallback={null}>
              <RefreshOnFocusProvider />
            </Suspense>
            {/* Scroll provider wraps header + content for docked music card */}
            <SpotifyScrollProvider>
              <Header />
              {/* Contained main content with consistent section spacing */}
              <Section sx={mainSectionSx}>
                <Container>
                  <main>{children}</main>
                </Container>
              </Section>
            </SpotifyScrollProvider>
            <Footer />
            <SpeedInsights />
            <Analytics />
          </GlobalStyleProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
