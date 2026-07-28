import 'server-only';

import { getLlmsFullTxt } from './getLlmsFullTxt';

export async function GET() {
  return new Response(await getLlmsFullTxt(), {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
