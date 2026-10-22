import 'server-only';

import { readFile } from 'node:fs/promises';
import { cacheLife } from 'next/cache';
import { ImageResponse } from 'next/og';
import { getIntroContent } from '../services/contentful';
import { SOCIAL_CARD_FONT, SocialCard } from './collage/SocialCard';
import { splitIntroDocument } from './collage/splitIntroDocument';
import { HOMEPAGE_TITLE, SITE_NAME } from './metadata';

export const SOCIAL_IMAGE_SIZE = {
  height: 630,
  width: 1200,
};

export const SOCIAL_IMAGE_ALT = `${SITE_NAME}'s portrait and the dg. logo on a paper-cut collage`;

const REGULAR_FONT_URL = new URL('./collage/fonts/Familjen-Grotesk-Regular.ttf', import.meta.url);
const BOLD_FONT_URL = new URL('./collage/fonts/Familjen-Grotesk-Bold.ttf', import.meta.url);
const GRAIN_URL = new URL('./collage/img/grain.png', import.meta.url);

/** Copied into a standalone `ArrayBuffer`, the shape `ImageResponse` fonts take. */
const readFontData = async (fontUrl: URL) => new Uint8Array(await readFile(fontUrl)).buffer;

const readPngDataUri = async (pngUrl: URL) =>
  `data:image/png;base64,${(await readFile(pngUrl)).toString('base64')}`;

/** Satori can't decode the WebP the homepage serves, so the card asks Contentful for a JPEG. */
function toJpegUrl(contentfulImageUrl: string): string {
  const url = new URL(contentfulImageUrl);
  url.searchParams.set('fm', 'jpg');
  return url.toString();
}

/**
 * `ImageResponse` reads fonts and loads its renderer while it streams, and
 * that uncached I/O would keep the image routes from prerendering under Cache
 * Components. Caching the finished PNG lets the build bake it in.
 */
async function renderSocialImagePng() {
  'use cache';
  cacheLife('max');
  const [regularFont, boldFont, grainUrl, intro] = await Promise.all([
    readFontData(REGULAR_FONT_URL),
    readFontData(BOLD_FONT_URL),
    readPngDataUri(GRAIN_URL),
    getIntroContent(),
  ]);
  const headline = intro ? splitIntroDocument(intro.textBlock.content).headline : null;
  return new ImageResponse(
    <SocialCard
      grainUrl={grainUrl}
      headline={headline ?? SITE_NAME}
      name={SITE_NAME}
      portraitUrl={intro ? toJpegUrl(intro.image.url) : null}
      tagline={HOMEPAGE_TITLE}
    />,
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { data: regularFont, name: SOCIAL_CARD_FONT, weight: 400 },
        { data: boldFont, name: SOCIAL_CARD_FONT, weight: 700 },
      ],
    },
  ).arrayBuffer();
}

/**
 * Serves the homepage's Open Graph and Twitter card image.
 */
export async function createSocialImage() {
  return new Response(await renderSocialImagePng(), {
    headers: { 'Content-Type': 'image/png' },
  });
}
