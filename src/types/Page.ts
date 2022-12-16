import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';

export type GetLayout<PropsType> = (page: ReactElement, pageProps: PropsType) => ReactNode;

export type NextPageWithLayout<PropsType> = NextPage & {
  /**
   * All layouts must take a props from the page
   */
  getLayout?: GetLayout<PropsType>;
};

export type AppPropsWithLayout<PropsType> = AppProps<PropsType> & {
  Component: NextPageWithLayout<PropsType>;
};
