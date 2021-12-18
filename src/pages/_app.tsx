import '@picocss/pico/css/pico.classless.min.css';
import { AppProps } from 'next/app';

const DylApp = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />;

export default DylApp;
