import 'server-only';

import {
  htmlPathToMarkdownPath,
  llmsFullTxtRoute,
  llmsTxtRoute,
  markdownPages,
} from '@dg/shared-core/routes/app';
import { metadataBase, SITE_NAME } from '../../metadata';

const textResponse = (mediaTypes: ReadonlyArray<string>) => ({
  content: Object.fromEntries(
    mediaTypes.map((mediaType) => [mediaType, { schema: { type: 'string' } }]),
  ),
  description: 'Successful response',
});

const textGet = (summary: string, mediaTypes: ReadonlyArray<string>) => ({
  get: {
    responses: {
      '200': textResponse(mediaTypes),
    },
    summary,
  },
});

const negotiatedGet = (summary: string) => ({
  get: {
    parameters: [
      {
        description: 'Request text/markdown for the Markdown representation.',
        in: 'header',
        name: 'Accept',
        required: false,
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      '200': textResponse(['text/html', 'text/markdown']),
      '406': {
        description: 'The requested representation is not available',
      },
    },
    summary,
  },
});

export function getContentDiscoveryOpenApi() {
  const pagePaths = Object.fromEntries(
    markdownPages.flatMap((page) => [
      [page.path, negotiatedGet(`${page.title} page`)],
      [
        htmlPathToMarkdownPath(page.path),
        textGet(`${page.title} Markdown`, ['text/markdown']),
      ],
    ]),
  );

  return {
    info: {
      description:
        'Public, read-only endpoints for discovering and retrieving content from this personal site.',
      title: `${SITE_NAME} content discovery API`,
      version: '1.0.0',
    },
    openapi: '3.1.0',
    paths: {
      ...pagePaths,
      [llmsTxtRoute]: textGet('Curated LLM content index', ['text/markdown']),
      [llmsFullTxtRoute]: textGet('Combined site Markdown', ['text/markdown']),
      '/robots.txt': textGet('Crawler policy', ['text/plain']),
      '/sitemap.xml': textGet('Public page sitemap', ['application/xml']),
    },
    servers: [
      {
        url: new URL('/', metadataBase).origin,
      },
    ],
  };
}
