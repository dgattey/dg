import localFont from 'next/font/local';

export const familjen = localFont({
  adjustFontFallback: false,
  display: 'swap',
  fallback: ['familjenFallback'],
  src: './fonts/Familjen-Grotesk.woff2',
  variable: '--font-familjen',
  weight: '400 700',
});
