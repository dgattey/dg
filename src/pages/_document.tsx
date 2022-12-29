import Document, { Html, Head, Main, NextScript } from 'next/document';
import { getInitColorSchemeScript } from '@mui/material/styles';

/**
 * Make sure no SSR flash for color scheme - as we use system on startup
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          {getInitColorSchemeScript({ defaultMode: 'system' })}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
