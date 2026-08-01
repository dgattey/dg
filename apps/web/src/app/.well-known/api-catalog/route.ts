import 'server-only';

import { apiCatalogRoute } from '@dg/shared-core/routes/app';
import { getApiCatalog } from './getApiCatalog';

const headers = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=86400',
  'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  Link: `<${apiCatalogRoute}>; rel="api-catalog"; type="application/linkset+json"`,
};

export function GET() {
  return new Response(JSON.stringify(getApiCatalog()), { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
