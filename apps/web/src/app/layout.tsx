import '@dg/ui/theme/classNameSetupOnImport';
import '@dg/ui/core/transitions/pageTransitions.css';

import { JsOnlyStyle } from '@dg/ui/core/JsOnlyStyle';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { ColorSchemeScript } from '@dg/ui/theme/ColorSchemeScript';
import { ColorSchemeSync } from '@dg/ui/theme/ColorSchemeSync';
import { GlobalStyleProvider } from '@dg/ui/theme/GlobalStyleProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const serverTime = await getServerTime();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <ColorSchemeScript />
        <JsOnlyStyle />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ServerTimeProvider serverTime={serverTime}>
            <GlobalStyleProvider>
              <ColorSchemeSync />
              <RefreshOnFocusProvider />
              <WebMcpTools />
              {children}
              <SpeedInsights />
              <Analytics />
            </GlobalStyleProvider>
          </ServerTimeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
