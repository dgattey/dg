import { ImageResponse } from '@vercel/og';
import { invariant } from 'shared-core/helpers/invariant';
import { LOGO_FONT, OpenGraphImage, TEXT_FONT } from './OpenGraphImage';

/**
 * Generates a basic OpenGraph image with font data
 */
export async function generateOpenGraphImage({
  url,
  normalFont,
  boldFont,
}: {
  url: string | undefined;
  normalFont: Promise<ArrayBuffer>;
  boldFont: Promise<ArrayBuffer>;
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
          name: TEXT_FONT,
          data: normalFontData,
        },
        {
          name: LOGO_FONT,
          data: boldFontData,
        },
      ],
    },
  );
}
