import 'ui/theme/classNameSetupOnImport';

import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import { GlobalStyleProvider } from 'ui/theme/GlobalStyleProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export type PageProps = Record<string, unknown>;

export type NextPageWithLayout = NextPage & {
  /**
   * All layouts must take a props from the page
   */
  getLayout?: (page: ReactElement, pageProps: PageProps) => ReactNode;
};

type AppPropsWithLayout = AppProps<PageProps> & {
  Component: NextPageWithLayout;
};

/**
 * Responsible for injecting styles into the tree client-side
 * and handling per page layouts
 */
function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <GlobalStyleProvider>
      {getLayout(<Component {...pageProps} />, pageProps)}
      <SpeedInsights />
      <Analytics />
    </GlobalStyleProvider>
  );
}

export default App;
