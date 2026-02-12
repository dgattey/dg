import '@dg/ui/theme/classNameSetupOnImport';

import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import type { SxObject } from '@dg/ui/theme';
import { themePreferenceAttribute, themeSelectorAttribute } from '@dg/ui/theme';
import { GlobalStyleProvider } from '@dg/ui/theme/GlobalStyleProvider';
import { InitColorSchemeScript } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServerTime } from '../services/getServerTime';
import { Footer } from './layouts/Footer';
import { Header } from './layouts/Header';
import { PageScrollProvider } from './layouts/PageScrollContext';
import { RefreshOnFocusProvider } from './layouts/RefreshOnFocusProvider';
import { SheetWrapper } from './layouts/SheetWrapper';
import { baseMetadata, viewport } from './metadata';

export const metadata: Metadata = baseMetadata;
export { viewport };

// Main content section spacing for home page content
const mainSectionSx: SxObject = {
  marginTop: 16,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Cached server time for hydration-safe relative time rendering
  const serverTime = await getServerTime();

  const htmlAttributes = {
    [themePreferenceAttribute]: 'system',
  };

  return (
    <html lang="en" {...htmlAttributes} suppressHydrationWarning={true}>
      <body>
        <InitColorSchemeScript attribute={themeSelectorAttribute} defaultMode="system" />
        <AppRouterCacheProvider>
          <ServerTimeProvider serverTime={serverTime}>
            <GlobalStyleProvider>
              {/* Refresh RSC data on focus or navigation */}
              <RefreshOnFocusProvider />
              {/* Scroll provider wraps header + content for docked header thumbnail */}
              <PageScrollProvider>
                <Header />
                {/* SheetWrapper handles layout for home vs sheet pages */}
                <SheetWrapper mainSectionSx={mainSectionSx}>{children}</SheetWrapper>
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
