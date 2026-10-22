import 'server-only';

import {
  apiCatalogRoute,
  apiOpenApiRoute,
  apiStatusRoute,
  llmsTxtRoute,
} from '@dg/shared-core/routes/app';
import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../agentDocumentCacheControl';
import { metadataBase } from '../../metadata';

const absoluteUrl = (pathname: string) => new URL(pathname, metadataBase).toString();

const headers = {
  'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
  'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
  Link: `<${apiCatalogRoute}>; rel="api-catalog"; type="application/linkset+json"`,
};

export function GET() {
  return new Response(
    JSON.stringify({
      linkset: [
        {
          anchor: absoluteUrl('/'),
          'service-desc': [
            {
              href: absoluteUrl(apiOpenApiRoute),
              type: 'application/vnd.oai.openapi+json;version=3.1.0',
            },
          ],
          'service-doc': [
            {
              href: absoluteUrl(llmsTxtRoute),
              type: 'text/markdown',
            },
          ],
          status: [
            {
              href: absoluteUrl(apiStatusRoute),
              type: 'application/json',
            },
          ],
        },
      ],
    }),
    { headers },
  );
}

export function HEAD() {
  return new Response(null, { headers });
}
