import 'server-only';

import { getLlmsTxt } from './getLlmsTxt';

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
