/**
 * @jest-environment node
 */

import { GET } from '../[name]/SKILL.md/route';

describe('GET /.well-known/agent-skills/[name]/SKILL.md', () => {
  it('serves a known skill as markdown', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ name: 'browse-llms-txt' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    const body = await response.text();
    expect(body).toContain('name: browse-llms-txt');
    expect(body).toContain('/llms.txt');
  });

  it('returns 404 for an unknown skill', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ name: 'missing-skill' }),
    });

    expect(response.status).toBe(404);
  });
});
