import { createHash } from 'node:crypto';

import { browseLlmsTxtSkill } from './skills/browseLlmsTxt';
import { markdownNegotiationSkill } from './skills/markdownNegotiation';
import { musicAndAlbumsSkill } from './skills/musicAndAlbums';

export const AGENT_SKILLS_SCHEMA =
  'https://schemas.agentskills.io/discovery/0.2.0/schema.json' as const;

export const agentSkillsPrefix = '/.well-known/agent-skills' as const;

export type AgentSkillDefinition = {
  description: string;
  name: string;
  skillMd: string;
};

/** Skills published for agents consuming this site. */
export const agentSkills = [
  browseLlmsTxtSkill,
  markdownNegotiationSkill,
  musicAndAlbumsSkill,
] as const satisfies ReadonlyArray<AgentSkillDefinition>;

export type AgentSkillName = (typeof agentSkills)[number]['name'];

export function isAgentSkillName(name: string): name is AgentSkillName {
  return agentSkills.some((skill) => skill.name === name);
}

export function getAgentSkill(name: string): AgentSkillDefinition | undefined {
  return agentSkills.find((skill) => skill.name === name);
}

export function sha256Digest(content: string): `sha256:${string}` {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

export function skillArtifactUrl(name: string): string {
  return `${agentSkillsPrefix}/${name}/SKILL.md`;
}

/** Discovery index per Agent Skills Discovery RFC v0.2.0. */
export function getAgentSkillsIndex() {
  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills: agentSkills.map((skill) => ({
      description: skill.description,
      digest: sha256Digest(skill.skillMd),
      name: skill.name,
      type: 'skill-md' as const,
      url: skillArtifactUrl(skill.name),
    })),
  };
}
