import { invariant } from '@dg/shared-core/helpers/invariant';
import { ImageResponse } from '@vercel/og';
import { OpenGraphImage } from './OpenGraphImage';
import { LOGO_FONT, TEXT_FONT } from './ogFonts';

/**
 * Generates a basic OpenGraph image with font data
 */
export async function generateOpenGraphImage({
  url,
  normalFont,
  boldFont,
  size,
}: {
  url: string | undefined;
  normalFont: Promise<ArrayBuffer>;
  boldFont: Promise<ArrayBuffer>;
  size?: { height: number; width: number };
}) {
  invariant(url, 'URL is required');
  const [normalFontData, boldFontData] = await Promise.all([normalFont, boldFont]);
  const params = new URL(url).searchParams;
  return new ImageResponse(
    <OpenGraphImage
      subtitle={params.get('subtitle') ?? ''}
      text={params.get('text') ?? 'Dylan Gattey'}
    />,
    {
      fonts: [
        {
          data: normalFontData,
          name: TEXT_FONT,
        },
        {
          data: boldFontData,
          name: LOGO_FONT,
        },
      ],
      ...size,
    },
  );
}
