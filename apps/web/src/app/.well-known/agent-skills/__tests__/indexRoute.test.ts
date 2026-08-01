/**
 * @jest-environment node
 */

import { GET } from '../index.json/route';

describe('GET /.well-known/agent-skills/index.json', () => {
  it('returns the discovery index as JSON', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const body = await response.json();
    expect(body.$schema).toBe('https://schemas.agentskills.io/discovery/0.2.0/schema.json');
    expect(Array.isArray(body.skills)).toBe(true);
    expect(body.skills.length).toBeGreaterThan(0);
  });
});
