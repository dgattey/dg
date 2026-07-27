import 'server-only';

import { homeRoute } from '@dg/shared-core/routes/app';
import { getPageMarkdown } from '../../services/markdown/getPageMarkdown';
import { markdownResponse } from '../../services/markdown/markdownResponse';

/**
 * Markdown twin for `/` at `/index.md`.
 */
export async function GET(request: Request) {
  const markdown = await getPageMarkdown(homeRoute);
  if (!markdown) {
    return new Response('Not found', { status: 404 });
  }
  return markdownResponse(markdown, { htmlPath: homeRoute, request });
}
