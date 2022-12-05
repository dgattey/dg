import { AppStyle } from 'components/AppStyle';
import { AppProps } from 'next/app';

/**
 * Responsible for injecting styles into the tree client-side.
 */
function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AppStyle />
      <Component {...pageProps} />
    </>
  );
}

export default App;
