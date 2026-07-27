import '@dg/ui/theme/classNameSetupOnImport';

import { Section } from '@dg/ui/core/Section';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import type { SxObject } from '@dg/ui/theme';
import { ColorSchemeScript } from '@dg/ui/theme/ColorSchemeScript';
import { SYSTEM_COLOR_SCHEME_STYLE } from '@dg/ui/theme/colorScheme';
import { GlobalStyleProvider } from '@dg/ui/theme/GlobalStyleProvider';
import Container from '@mui/material/Container';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServerTime } from '../services/getServerTime';
import { Footer } from './layouts/Footer';
import { Header } from './layouts/Header';
import { PageScrollProvider } from './layouts/PageScrollContext';
import { RefreshOnFocusProvider } from './layouts/RefreshOnFocusProvider';
import { baseMetadata, viewport } from './metadata';

export const metadata: Metadata = baseMetadata;
export { viewport };

const mainSectionSx: SxObject = {
  marginTop: 16,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Cached server time for hydration-safe relative time rendering
  const serverTime = await getServerTime();

  return (
    <html lang="en" style={SYSTEM_COLOR_SCHEME_STYLE} suppressHydrationWarning={true}>
      <body>
        <ColorSchemeScript />
        <AppRouterCacheProvider>
          <ServerTimeProvider serverTime={serverTime}>
            <GlobalStyleProvider>
              {/* Refresh RSC data on focus or navigation */}
              <RefreshOnFocusProvider />
              {/* Scroll provider wraps header + content for docked header thumbnail */}
              <PageScrollProvider>
                <Header />
                {/* Contained main content with consistent section spacing */}
                <Section sx={mainSectionSx}>
                  <Container>
                    <main>{children}</main>
                  </Container>
                </Section>
              </PageScrollProvider>
              <Footer />
              <SpeedInsights />
              <Analytics />
            </GlobalStyleProvider>
          </ServerTimeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
