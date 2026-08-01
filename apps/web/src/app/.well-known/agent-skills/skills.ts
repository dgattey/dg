import 'server-only';

import { createHash } from 'node:crypto';
import { agentSkillArtifactPath } from '@dg/shared-core/routes/app';
import { SITE_NAME } from '../../metadata';

export const AGENT_SKILLS_SCHEMA =
  'https://schemas.agentskills.io/discovery/0.2.0/schema.json' as const;

export type AgentSkillDefinition = {
  name: string;
  description: string;
  body: string;
};

/**
 * Honest skills for this site's real agent surface.
 * Digests are computed from these exact UTF-8 bytes at request time.
 */
export const agentSkills = [
  {
    body: `---
name: read-site
description: Read Dylan Gattey personal site content via llms.txt, .md page twins, and Accept: text/markdown negotiation. Use when fetching about/projects, listening history, or favorite albums without scraping HTML.
---

# Read ${SITE_NAME}

Public content on this personal site is available as Markdown. Prefer those endpoints over HTML scraping.

## Start here

1. Fetch \`/llms.txt\` for the curated page index.
2. Open the \`.md\` links in that index for token-efficient page content.
3. Or request any public HTML page with \`Accept: text/markdown\` to receive the Markdown twin at the same URL.

## Public pages

| Page | HTML | Markdown |
| --- | --- | --- |
| Home | \`/\` | \`/index.md\` |
| Listening history | \`/music\` | \`/music.md\` |
| Favorite albums | \`/music/albums\` | \`/music/albums.md\` |

## Bulk load

- \`/llms-full.txt\` concatenates every public page as Markdown.

## Do not

- Do not treat \`/api/*\`, \`/dev-console\`, OAuth, or webhook routes as public content APIs.
- This skill does not claim an MCP server, OAuth protected resources, or write tools.
`,
    description:
      'Read Dylan Gattey personal site content via llms.txt, .md page twins, and Accept: text/markdown negotiation. Use when fetching about/projects, listening history, or favorite albums without scraping HTML.',
    name: 'read-site',
  },
] as const satisfies ReadonlyArray<AgentSkillDefinition>;

export type AgentSkillName = (typeof agentSkills)[number]['name'];

export function isAgentSkillName(value: string): value is AgentSkillName {
  return agentSkills.some((skill) => skill.name === value);
}

export function getAgentSkill(name: AgentSkillName): AgentSkillDefinition {
  const skill = agentSkills.find((entry) => entry.name === name);
  if (!skill) {
    throw new Error(`Unknown agent skill: ${name}`);
  }
  return skill;
}

export function getAgentSkillMarkdown(name: AgentSkillName): string {
  return getAgentSkill(name).body;
}

function sha256Digest(bytes: string): `sha256:${string}` {
  const hex = createHash('sha256').update(bytes, 'utf8').digest('hex');
  return `sha256:${hex}`;
}

export type AgentSkillsIndex = {
  $schema: typeof AGENT_SKILLS_SCHEMA;
  skills: Array<{
    name: string;
    type: 'skill-md';
    description: string;
    url: string;
    digest: `sha256:${string}`;
  }>;
};

/** Discovery index whose digests match the bytes returned by the SKILL.md routes. */
export function getAgentSkillsIndex(): AgentSkillsIndex {
  return {
    $schema: AGENT_SKILLS_SCHEMA,
    skills: agentSkills.map((skill) => ({
      description: skill.description,
      digest: sha256Digest(skill.body),
      name: skill.name,
      type: 'skill-md' as const,
      url: agentSkillArtifactPath(skill.name),
    })),
  };
}
