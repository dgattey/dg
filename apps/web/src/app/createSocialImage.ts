import { generateOpenGraphImage } from '@dg/og/generateOpenGraphImage';
import { LOGO_FONT_URL, TEXT_FONT_URL } from '@dg/og/ogFonts';
import { HOMEPAGE_TITLE, metadataBase, SITE_NAME } from './metadata';

const resolveFontUrl = (fontUrl: string | URL) => {
  // Always resolve against metadataBase - import.meta.url-based URLs may be
  // relative paths in SSR that fetch() can't use directly
  const pathname = fontUrl instanceof URL ? fontUrl.pathname : fontUrl;
  return new URL(pathname, metadataBase);
};

const normalFont = fetch(resolveFontUrl(TEXT_FONT_URL)).then((res) => res.arrayBuffer());
const boldFont = fetch(resolveFontUrl(LOGO_FONT_URL)).then((res) => res.arrayBuffer());

/**
 * Creates a social media image (Open Graph or Twitter) for the homepage.
 * @param pathname - The URL pathname for the image (e.g., '/opengraph-image' or '/twitter-image')
 */
export function createSocialImage(pathname: string) {
  const url = new URL(pathname, metadataBase);
  url.searchParams.set('text', HOMEPAGE_TITLE);
  url.searchParams.set('subtitle', SITE_NAME);
  return generateOpenGraphImage({
    boldFont,
    normalFont,
    url: url.toString(),
  });
}
