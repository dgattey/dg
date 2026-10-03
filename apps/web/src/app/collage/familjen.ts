import localFont from 'next/font/local';

/**
 * The Arial fallback metrics live in collage.css: Next's adjustFontFallback would tag every
 * page, classic included, with a next-size-adjust meta.
 */
export const familjen = localFont({
  adjustFontFallback: false,
  display: 'swap',
  fallback: ['familjenFallback'],
  src: './fonts/Familjen-Grotesk.woff2',
  variable: '--font-familjen',
  weight: '400 700',
});
