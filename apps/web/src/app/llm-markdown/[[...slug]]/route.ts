import 'server-only';

import { homeRoute, isMarkdownPagePath, markdownPagePaths } from '@dg/shared-core/routes/app';
import { NextResponse } from 'next/server';
import { AGENT_DOCUMENT_CACHE_CONTROL } from '../../agentDocumentCacheControl';
import { getPageMarkdown } from '../pageMarkdown';

type RouteContext = {
  params: Promise<{ slug?: Array<string> }>;
};

export function generateStaticParams() {
  return markdownPagePaths.map((pathname) => ({
    slug: pathname === homeRoute ? [] : pathname.slice(1).split('/'),
  }));
}

/**
 * Internal Markdown endpoint. Public clients use `.md` URLs or Accept negotiation;
 * proxy rewrites those here.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const pathname = !slug || slug.length === 0 ? homeRoute : `/${slug.join('/')}`;

  if (!isMarkdownPagePath(pathname)) {
    return new Response('Not found', { status: 404 });
  }

  const body = await getPageMarkdown(pathname);

  return new NextResponse(body, {
    headers: {
      'Cache-Control': AGENT_DOCUMENT_CACHE_CONTROL,
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${pathname}>; rel="alternate"; type="text/html"`,
      Vary: 'Accept',
    },
  });
}
