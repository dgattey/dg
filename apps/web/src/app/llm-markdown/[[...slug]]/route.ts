import 'server-only';

import { homeRoute, isMarkdownPagePath } from '@dg/shared-core/routes/app';
import { markdownResponse } from '../markdownResponse';
import { getPageMarkdown } from '../pageMarkdown';

type RouteContext = {
  params: Promise<{ slug?: Array<string> }>;
};

/**
 * Internal Markdown endpoint. Public clients use `.md` URLs or Accept negotiation;
 * proxy rewrites those here.
 */
export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const pathname = !slug || slug.length === 0 ? homeRoute : `/${slug.join('/')}`;

  if (!isMarkdownPagePath(pathname)) {
    return new Response('Not found', { status: 404 });
  }

  return markdownResponse(await getPageMarkdown(pathname), {
    htmlPath: pathname,
    request,
  });
}
