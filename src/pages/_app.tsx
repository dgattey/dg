import AppStyle from 'components/AppStyle';
import { AppProps } from 'next/app';

/**
 * Responsible for injecting styles into the tree client-side.
 */
const App = ({ Component, pageProps }: AppProps) => (
  <>
    <AppStyle />
    <Component {...pageProps} />
  </>
);

export default App;
