import type { NextApiRequest } from 'next';
import { generateOpenGraphImage } from 'og/generateOpenGraphImage';

export const config = {
  runtime: 'edge',
};

const normalFont = fetch(
  new URL('../../../../../../packages/og/SFProText.ttf', import.meta.url),
).then((res) => res.arrayBuffer());
const boldFont = fetch(
  new URL('../../../../../../packages/og/SFProDisplayHeavy.ttf', import.meta.url),
).then((res) => res.arrayBuffer());

/**
 * For GETs, returns an Open Graph image for the text in the query string.
 */
export default async function handler(request: NextApiRequest) {
  const { method } = request;
  switch (method) {
    case 'GET': {
      return generateOpenGraphImage({ url: request.url, normalFont, boldFont });
    }
    default: {
      return new Response(
        JSON.stringify({ error: `Method ${method ?? '<Unknown>'} Not Allowed` }),
        {
          status: 405,
        },
      );
    }
  }
}
