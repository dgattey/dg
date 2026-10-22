import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { homeRoute, isMarkdownPagePath } from '@dg/shared-core/routes/app';
import { NextResponse } from 'next/server';
import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../agentDocumentCacheControl';
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

  const body = await getPageMarkdown(pathname);
  log.info('markdown_fetch', {
    path: pathname,
    ref: request.headers.get('referer') ?? '',
    ua: request.headers.get('user-agent') ?? '',
  });

  return new NextResponse(body, {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${pathname}>; rel="alternate"; type="text/html"`,
      Vary: 'Accept',
    },
  });
}
