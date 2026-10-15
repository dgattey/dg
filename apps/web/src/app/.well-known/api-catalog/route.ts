import 'server-only';

import { apiCatalogRoute } from '@dg/shared-core/routes/app';
import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../agentDocumentCacheControl';
import { getApiCatalog } from './getApiCatalog';

const headers = {
  'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
  'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  Link: `<${apiCatalogRoute}>; rel="api-catalog"; type="application/linkset+json"`,
};

export function GET() {
  return new Response(JSON.stringify(getApiCatalog()), { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
