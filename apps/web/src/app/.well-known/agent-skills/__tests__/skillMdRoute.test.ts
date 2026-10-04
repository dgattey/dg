/**
 * @jest-environment node
 */

import { GET, generateStaticParams } from '../[name]/SKILL.md/route';
import { GET as getIndex } from '../index.json/route';

describe('GET /.well-known/agent-skills/[name]/SKILL.md', () => {
  it('prerenders exactly the skills the discovery index links to', async () => {
    const index: { skills: Array<{ url: string }> } = await getIndex().json();
    const prerenderedUrls = generateStaticParams().map(
      ({ name }) => `/.well-known/agent-skills/${name}/SKILL.md`,
    );

    expect(prerenderedUrls).toEqual(index.skills.map(({ url }) => url));
    expect(prerenderedUrls).toContain('/.well-known/agent-skills/browse-llms-txt/SKILL.md');
  });

  it('serves every prerendered skill as markdown', async () => {
    for (const params of generateStaticParams()) {
      const response = await GET(new Request('http://localhost'), {
        params: Promise.resolve(params),
      });

      expect(response.status).toBe(200);
      expect(await response.text()).toContain(`name: ${params.name}\n`);
    }
  });

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
