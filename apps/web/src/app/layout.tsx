import '@dg/ui/theme/classNameSetupOnImport';

import { Section } from '@dg/ui/core/Section';
import type { SxObject } from '@dg/ui/theme';
import { themePreferenceAttribute, themeSelectorAttribute } from '@dg/ui/theme';
import { GlobalStyleProvider } from '@dg/ui/theme/GlobalStyleProvider';
import { InitColorSchemeScript } from '@mui/material';
import Container from '@mui/material/Container';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { ReactNode } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { RefreshOnFocusProvider } from '../components/layouts/RefreshOnFocusProvider';
import { ScrollIndicatorShell } from '../components/layouts/ScrollIndicatorShell';
import { baseMetadata, viewport } from './metadata';

export const metadata = baseMetadata;
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
            {/* Refresh RSC data when window regains focus */}
            <RefreshOnFocusProvider />
            {/* Header + scroll indicator state wrapper */}
            <ScrollIndicatorShell>
              <Header />
            </ScrollIndicatorShell>
            {/* Contained main content with consistent section spacing */}
            <Section sx={mainSectionSx}>
              <Container>
                <main>{children}</main>
              </Container>
            </Section>
            <Footer />
            <SpeedInsights />
            <Analytics />
          </GlobalStyleProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
