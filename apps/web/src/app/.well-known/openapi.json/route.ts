import 'server-only';

import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../agentDocumentCacheControl';
import { getContentDiscoveryOpenApi } from './getContentDiscoveryOpenApi';

export function GET() {
  return new Response(JSON.stringify(getContentDiscoveryOpenApi()), {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'application/vnd.oai.openapi+json;version=3.1.0',
    },
  });
}
