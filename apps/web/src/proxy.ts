import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { negotiateMarkdown } from './services/markdown/contentNegotiation';

export function proxy(request: NextRequest): NextResponse {
  return negotiateMarkdown(request) ?? NextResponse.next();
}

export const config = {
  matcher: [
    {
      missing: [
        { key: 'rsc', type: 'header' },
        { key: 'next-router-prefetch', type: 'header' },
        { key: 'purpose', type: 'header', value: 'prefetch' },
      ],
      source:
        '/((?!_next/|_vercel/|api/|dev-console(?:/|$)|\\.well-known/|llm-markdown/|(?:.*/)?(?:opengraph|twitter)-image|.*\\.(?!md$)[^/]+$).*)',
    },
  ],
};
