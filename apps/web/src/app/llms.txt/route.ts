import 'server-only';

import { getLlmsTxt } from '../../services/markdown/getLlmsTxt';

export async function GET() {
  const body = await getLlmsTxt();
  return new Response(body, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
