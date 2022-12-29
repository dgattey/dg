import type { NextApiRequest } from 'next';
import { ImageResponse } from '@vercel/og';
import { LOGO_FONT, OpenGraphImage, TEXT_FONT } from 'og/OpenGraphImage';

export const config = {
  runtime: 'experimental-edge',
};

const normalFont = fetch(new URL('../../../og/SFProText.ttf', import.meta.url)).then((res) =>
  res.arrayBuffer(),
);
const boldFont = fetch(new URL('../../../og/SFProDisplayHeavy.ttf', import.meta.url)).then((res) =>
  res.arrayBuffer(),
);

/**
 * For GETs, returns an Open Graph image for the text in the query string.
 */
export default async function handler(request: NextApiRequest) {
  const { method } = request;
  switch (method) {
    case 'GET': {
      const [normalFontData, boldFontData] = await Promise.all([normalFont, boldFont]);
      const params = new URL(request.url ?? '').searchParams;
      return new ImageResponse(
        (
          <OpenGraphImage
            text={params.get('text') ?? 'Dylan Gattey'}
            subtitle={params.get('subtitle') ?? ''}
          />
        ),
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
    default: {
      return new Response(JSON.stringify({ error: `Method ${method ?? ''} Not Allowed` }), {
        status: 405,
      });
    }
  }
}
