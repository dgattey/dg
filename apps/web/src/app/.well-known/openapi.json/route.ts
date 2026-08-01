import 'server-only';

import { getContentDiscoveryOpenApi } from './getContentDiscoveryOpenApi';

export function GET() {
  return new Response(JSON.stringify(getContentDiscoveryOpenApi()), {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
      'Content-Type': 'application/vnd.oai.openapi+json;version=3.1.0',
    },
  });
}
