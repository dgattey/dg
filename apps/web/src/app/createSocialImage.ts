import { generateOpenGraphImage } from '@dg/og/generateOpenGraphImage';
import { getLogoFontData, getTextFontData } from '@dg/og/ogFonts';
import { cacheLife } from 'next/cache';
import { metadataBase } from './metadata';

export const SOCIAL_IMAGE_SIZE = {
  height: 630,
  width: 1200,
};

/**
 * `ImageResponse` reads fonts and loads its renderer while it streams, and
 * that uncached I/O would keep the image routes from prerendering under Cache
 * Components. Caching the finished PNG lets the build bake it in.
 */
async function renderSocialImagePng(url: string) {
  'use cache';
  cacheLife('max');
  const [normalFont, boldFont] = await Promise.all([getTextFontData(), getLogoFontData()]);
  return generateOpenGraphImage({
    boldFont,
    normalFont,
    size: SOCIAL_IMAGE_SIZE,
    url,
  }).arrayBuffer();
}

/**
 * Creates a social media image (Open Graph or Twitter) for the given text.
 * @param pathname - The URL pathname for the image (e.g., '/opengraph-image' or '/twitter-image')
 * @param text - The main text to render
 * @param subtitle - The subtitle text to render
 */
export async function createSocialImage(pathname: string, text: string, subtitle: string) {
  const url = new URL(pathname, metadataBase);
  url.searchParams.set('text', text);
  url.searchParams.set('subtitle', subtitle);
  return new Response(await renderSocialImagePng(url.toString()), {
    headers: { 'Content-Type': 'image/png' },
  });
}
