import '@dg/ui/core/transitions/pageTransitions.css';

import { JsOnlyStyle } from '@dg/ui/core/JsOnlyStyle';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { getGlobalThemeCss } from '@dg/ui/theme';
import { ColorSchemeScript } from '@dg/ui/theme/ColorSchemeScript';
import { ColorSchemeSync } from '@dg/ui/theme/ColorSchemeSync';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServerTime } from '../services/getServerTime';
import { RefreshOnFocusProvider } from './layouts/RefreshOnFocusProvider';
import { WebMcpTools } from './layouts/WebMcpTools';
import { baseMetadata, viewport } from './metadata';

export const metadata: Metadata = baseMetadata;
export { viewport };

const globalThemeCss = getGlobalThemeCss();

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Cached server time for hydration-safe relative time rendering
  const serverTime = await getServerTime();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <ColorSchemeScript />
        <JsOnlyStyle />
        <style>{globalThemeCss}</style>
      </head>
      <body>
        <ServerTimeProvider serverTime={serverTime}>
          {/* Restores the stored scheme that hydration strips off <html> */}
          <ColorSchemeSync />
          {/* Refresh RSC data on focus or navigation */}
          <RefreshOnFocusProvider />
          <WebMcpTools />
          {children}
          <SpeedInsights />
          <Analytics />
        </ServerTimeProvider>
      </body>
    </html>
  );
}
