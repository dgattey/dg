import localFont from 'next/font/local';

export const familjen = localFont({
  adjustFontFallback: 'Arial',
  display: 'swap',
  src: './fonts/Familjen-Grotesk.woff2',
  variable: '--font-familjen',
  weight: '400 700',
});
