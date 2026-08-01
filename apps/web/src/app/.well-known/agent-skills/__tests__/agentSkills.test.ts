/**
 * @jest-environment node
 */

import {
  AGENT_SKILLS_SCHEMA,
  agentSkills,
  getAgentSkill,
  getAgentSkillsIndex,
  isAgentSkillName,
  sha256Digest,
  skillArtifactUrl,
} from '../agentSkills';

describe('agentSkills', () => {
  it('builds a v0.2.0 discovery index with matching digests', () => {
    const index = getAgentSkillsIndex();

    expect(index.$schema).toBe(AGENT_SKILLS_SCHEMA);
    expect(index.skills).toHaveLength(agentSkills.length);

    for (const entry of index.skills) {
      expect(entry.type).toBe('skill-md');
      expect(entry.url).toBe(skillArtifactUrl(entry.name));
      expect(entry.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(isAgentSkillName(entry.name)).toBe(true);

      const skill = getAgentSkill(entry.name);
      expect(skill).toBeDefined();
      if (!skill) {
        return;
      }
      expect(entry.digest).toBe(sha256Digest(skill.skillMd));
      expect(skill.skillMd.startsWith('---\n')).toBe(true);
      expect(skill.skillMd).toContain(`name: ${entry.name}`);
    }
  });

  it('rejects unknown skill names', () => {
    expect(isAgentSkillName('not-a-skill')).toBe(false);
    expect(getAgentSkill('not-a-skill')).toBeUndefined();
  });
});
