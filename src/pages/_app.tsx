import { GlobalStyleProvider } from 'ui/GlobalStyle';
import { AppProps } from 'next/app';

/**
 * Responsible for injecting styles into the tree client-side.
 */
function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalStyleProvider>
      <Component {...pageProps} />
    </GlobalStyleProvider>
  );
}

export default App;
