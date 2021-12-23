import '@picocss/pico/css/pico.min.css';
import { AppProps } from 'next/app';

const App = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />;

export default App;
