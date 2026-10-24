import '@dg/ui/core/transitions/pageTransitions.css';
import './collage/collage.css';
import './collage/chrome.css';

import { JsOnlyStyle } from '@dg/ui/core/JsOnlyStyle';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { getGlobalThemeCss } from '@dg/ui/theme';
import { ColorSchemeScript } from '@dg/ui/theme/ColorSchemeScript';
import { ColorSchemeSync } from '@dg/ui/theme/ColorSchemeSync';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServerTime } from '../services/getServerTime';
import { familjen } from './collage/familjen';
import { Footer } from './layouts/Footer';
import { Header } from './layouts/Header';
import { PageViewTransition } from './layouts/PageViewTransition';
import { WebMcpTools } from './layouts/WebMcpTools';
import { baseMetadata, viewport } from './metadata';
import { NowPlayingProvider } from './spotify/NowPlayingContext';

export const metadata: Metadata = baseMetadata;
export { viewport };

const globalThemeCss = getGlobalThemeCss();

export default async function RootLayout({ children }: { children: ReactNode }) {
  const serverTime = await getServerTime();

  return (
    <html className={familjen.variable} lang="en" suppressHydrationWarning={true}>
      <head>
        <ColorSchemeScript />
        <JsOnlyStyle />
        <style>{globalThemeCss}</style>
      </head>
      <body>
        <ServerTimeProvider serverTime={serverTime}>
          <ColorSchemeSync />
          <WebMcpTools />
          <div className="collageRoot">
            <NowPlayingProvider>
              <div className="collageSheet">
                <Header />
                <main className="collageMain">
                  <PageViewTransition>{children}</PageViewTransition>
                </main>
              </div>
              <Footer />
            </NowPlayingProvider>
          </div>
          <SpeedInsights />
          <Analytics />
        </ServerTimeProvider>
      </body>
    </html>
  );
}
