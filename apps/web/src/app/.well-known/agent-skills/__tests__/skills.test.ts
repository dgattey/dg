/**
 * @jest-environment node
 */

import { createHash } from 'node:crypto';

jest.mock('../../../metadata', () => ({
  SITE_NAME: 'Dylan Gattey',
}));

describe('agent skills discovery', () => {
  it('publishes a v0.2.0 index whose digests match served SKILL.md bytes', async () => {
    const { AGENT_SKILLS_SCHEMA, getAgentSkillMarkdown, getAgentSkillsIndex } = await import(
      '../skills'
    );

    const index = getAgentSkillsIndex();

    expect(index.$schema).toBe(AGENT_SKILLS_SCHEMA);
    expect(index.skills.length).toBeGreaterThan(0);

    for (const entry of index.skills) {
      expect(entry.type).toBe('skill-md');
      expect(entry.url).toBe(`/.well-known/agent-skills/${entry.name}/SKILL.md`);
      expect(['read-site']).toContain(entry.name);
      const body = getAgentSkillMarkdown('read-site');
      const digest = `sha256:${createHash('sha256').update(body, 'utf8').digest('hex')}`;
      expect(entry.digest).toBe(digest);
      expect(body).toContain('name: read-site');
      expect(body).toContain('does not claim an MCP server');
      expect(body).not.toContain('server-card');
    }
  });

  it('serves the index and skill artifact from route handlers', async () => {
    const { GET: getIndex } = await import('../index.json/route');
    const indexResponse = getIndex();
    const indexBody = await indexResponse.json();

    expect(indexResponse.status).toBe(200);
    expect(indexResponse.headers.get('Content-Type')).toContain('application/json');
    expect(indexResponse.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(indexResponse.headers.get('Link')).toContain('rel="agent-skills"');
    expect(indexBody.skills[0].name).toBe('read-site');

    const { GET: getSkill } = await import('../[skill]/SKILL.md/route');
    const skillResponse = await getSkill(new Request('https://dylangattey.com'), {
      params: Promise.resolve({ skill: 'read-site' }),
    });
    const skillBody = await skillResponse.text();

    expect(skillResponse.status).toBe(200);
    expect(skillResponse.headers.get('Content-Type')).toContain('text/markdown');
    expect(skillBody).toContain('# Read Dylan Gattey');
  });
});
