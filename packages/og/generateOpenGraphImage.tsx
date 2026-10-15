import { invariant } from '@dg/shared-core/assertions/invariant';
import { ImageResponse } from 'next/og';
import { OpenGraphImage } from './OpenGraphImage';
import { LOGO_FONT, TEXT_FONT } from './ogFonts';

/**
 * Generates a basic OpenGraph image with font data
 */
export function generateOpenGraphImage({
  url,
  normalFont,
  boldFont,
  size,
}: {
  url: string | undefined;
  normalFont: ArrayBuffer;
  boldFont: ArrayBuffer;
  size?: { height: number; width: number };
}) {
  invariant(url, 'URL is required');
  const params = new URL(url).searchParams;
  return new ImageResponse(
    <OpenGraphImage
      subtitle={params.get('subtitle') ?? ''}
      text={params.get('text') ?? 'Dylan Gattey'}
    />,
    {
      fonts: [
        {
          data: normalFont,
          name: TEXT_FONT,
        },
        {
          data: boldFont,
          name: LOGO_FONT,
        },
      ],
      ...size,
    },
  );
}
