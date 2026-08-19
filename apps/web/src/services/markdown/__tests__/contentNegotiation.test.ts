import { NextRequest, NextResponse } from 'next/server';
import { negotiateMarkdown, withMarkdownAlternate } from '../contentNegotiation';

const createRequest = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://example.com${path}`, { headers });

describe('negotiateMarkdown', () => {
  it('rewrites .md URLs to the internal markdown handler', () => {
    const response = negotiateMarkdown(createRequest('/index.md'));

    expect(response).not.toBeNull();
    expect(response?.headers.get('x-middleware-rewrite')).toContain('/llm-markdown');
    expect(response?.headers.get('Vary')).toContain('Accept');
  });

  it('rewrites when Accept explicitly prefers markdown', () => {
    const response = negotiateMarkdown(
      createRequest('/', { accept: 'text/markdown, text/html;q=0.9' }),
    );

    expect(response).not.toBeNull();
    expect(response?.headers.get('x-middleware-rewrite')).toContain('/llm-markdown');
  });

  it('leaves HTML responses for the caller to build', () => {
    expect(negotiateMarkdown(createRequest('/music', { accept: 'text/html' }))).toBeNull();
  });

  it('adds Link and Vary on HTML responses via withMarkdownAlternate', () => {
    const response = withMarkdownAlternate(
      createRequest('/music', { accept: 'text/html' }),
      NextResponse.next(),
    );

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('Link')).toContain('/music.md');
    expect(response.headers.get('Vary')).toContain('Accept');
  });

  it('returns 406 when no produced type is acceptable', () => {
    const response = negotiateMarkdown(createRequest('/', { accept: 'application/pdf' }));

    expect(response?.status).toBe(406);
    expect(response?.headers.get('Vary')).toContain('Accept');
  });

  it('skips negotiation for RSC requests with the rsc header', () => {
    const response = negotiateMarkdown(createRequest('/', { accept: 'application/pdf', rsc: '1' }));

    expect(response).toBeNull();
  });

  it('skips negotiation for Flight Accept without rsc header (Proxy strips it)', () => {
    // Mirrors production Proxy: Next removes `rsc` from request.headers, but
    // RSC resumes still send Accept: text/x-component.
    const response = negotiateMarkdown(createRequest('/', { accept: 'text/x-component' }));

    expect(response).toBeNull();
  });

  it('skips negotiation for Flight Accept that also lists html', () => {
    const response = negotiateMarkdown(
      createRequest('/', {
        accept: 'text/x-component, text/html;q=0.9',
      }),
    );

    expect(response).toBeNull();
  });

  it('ignores non-markdown pages', () => {
    expect(negotiateMarkdown(createRequest('/dev-console'))).toBeNull();
  });
});
