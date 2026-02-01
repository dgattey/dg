import { generateOpenGraphImage } from '@dg/og/generateOpenGraphImage';
import { LOGO_FONT_URL, TEXT_FONT_URL } from '@dg/og/ogFonts';
import { metadataBase } from './metadata';

export const SOCIAL_IMAGE_SIZE = {
  height: 630,
  width: 1200,
};

const normalFont = fetch(TEXT_FONT_URL).then((res) => res.arrayBuffer());
const boldFont = fetch(LOGO_FONT_URL).then((res) => res.arrayBuffer());

/**
 * Creates a social media image (Open Graph or Twitter) for the given text.
 * @param pathname - The URL pathname for the image (e.g., '/opengraph-image' or '/twitter-image')
 * @param text - The main text to render
 * @param subtitle - The subtitle text to render
 */
export function createSocialImage(pathname: string, text: string, subtitle: string) {
  const url = new URL(pathname, metadataBase);
  url.searchParams.set('text', text);
  url.searchParams.set('subtitle', subtitle);
  return generateOpenGraphImage({
    boldFont,
    normalFont,
    size: SOCIAL_IMAGE_SIZE,
    url: url.toString(),
  });
}
