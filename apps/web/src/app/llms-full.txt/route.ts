import 'server-only';

import { getLlmsFullTxt } from '../../services/markdown/getLlmsFullTxt';

export async function GET() {
  const body = await getLlmsFullTxt();
  return new Response(body, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
