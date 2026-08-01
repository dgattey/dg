import 'server-only';

import {
  apiOpenApiRoute,
  apiStatusRoute,
  llmsTxtRoute,
} from '@dg/shared-core/routes/app';
import { metadataBase } from '../../metadata';

type ApiCatalogLink = {
  href: string;
  type: string;
};

type ApiCatalogEntry = {
  anchor: string;
  'service-desc': [ApiCatalogLink];
  'service-doc': [ApiCatalogLink];
  status: [ApiCatalogLink];
};

type ApiCatalog = {
  linkset: [ApiCatalogEntry];
};

const absoluteUrl = (pathname: string) => new URL(pathname, metadataBase).toString();

export function getApiCatalog(): ApiCatalog {
  return {
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
  };
}
