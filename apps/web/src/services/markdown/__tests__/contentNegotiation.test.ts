import { NextRequest } from 'next/server';
import { negotiateMarkdown } from '../contentNegotiation';

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

  it('adds Link and Vary on HTML responses for public pages', () => {
    const response = negotiateMarkdown(createRequest('/music', { accept: 'text/html' }));

    expect(response).not.toBeNull();
    expect(response?.headers.get('x-middleware-next')).toBe('1');
    expect(response?.headers.get('Link')).toContain('/music.md');
    expect(response?.headers.get('Vary')).toContain('Accept');
  });

  it('returns 406 when no produced type is acceptable', () => {
    const response = negotiateMarkdown(createRequest('/', { accept: 'application/pdf' }));

    expect(response?.status).toBe(406);
    expect(response?.headers.get('Vary')).toContain('Accept');
  });

  it('skips negotiation for RSC requests', () => {
    const response = negotiateMarkdown(createRequest('/', { accept: 'application/pdf', rsc: '1' }));

    expect(response).toBeNull();
  });

  it('ignores non-markdown pages', () => {
    expect(negotiateMarkdown(createRequest('/dev-console'))).toBeNull();
  });
});
