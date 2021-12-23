import AppStyle from 'components/AppStyle';
import { AppProps } from 'next/app';

/**
 * Adds styles to the basic component here
 */
const App = ({ Component, pageProps }: AppProps) => (
  <>
    <AppStyle />
    <Component {...pageProps} />
  </>
);

export default App;
