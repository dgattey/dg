import AppStyle from '@dg/components/AppStyle';
import BaseApp, { AppContext, AppProps } from 'next/app';

/**
 * Responsible for injecting styles into the tree client-side.
 */
const App = ({ Component, pageProps }: AppProps) => (
  <>
    <AppStyle />
    <Component {...pageProps} />
  </>
);

// Helps Sentry via https://github.com/isaachinman/next-i18next/issues/615#issuecomment-575578375
export const getInitialProps = async (appContext: AppContext) => {
  const appProps = await BaseApp.getInitialProps(appContext);
  return { ...appProps };
};

export default App;
