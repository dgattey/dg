import { InitColorSchemeScript } from '@mui/material';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import { themeSelectorAttribute } from 'ui/theme';

/**
 * Make sure no SSR flash for color scheme - as we use system on startup
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <InitColorSchemeScript attribute={themeSelectorAttribute} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
