import 'server-only';

import { homeRoute, isMarkdownPagePath } from '@dg/shared-core/routes/app';
import { handleMarkdownRequest } from '../../../services/markdown/handleMarkdownRequest';

type RouteContext = {
  params: Promise<{ slug?: Array<string> }>;
};

/**
 * Internal Markdown representation endpoint. Public clients should use
 * `.md` URLs or `Accept: text/markdown` — proxy rewrites those here.
 */
export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const pathname = !slug || slug.length === 0 ? homeRoute : `/${slug.join('/')}`;

  if (!isMarkdownPagePath(pathname)) {
    return new Response('Not found', { status: 404 });
  }

  return handleMarkdownRequest(request, pathname);
}
