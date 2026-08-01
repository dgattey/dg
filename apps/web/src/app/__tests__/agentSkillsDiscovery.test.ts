/**
 * @jest-environment node
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';
const SKILL_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,63}$/;
const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;

const publicDir = resolve(__dirname, '../../../public');
const skillsDir = resolve(publicDir, '.well-known/agent-skills');
const indexPath = join(skillsDir, 'index.json');

type SkillIndexEntry = {
  name: string;
  type: string;
  description: string;
  url: string;
  digest: string;
};

type SkillIndex = {
  $schema: string;
  skills: Array<SkillIndexEntry>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseSkillIndex(raw: string): SkillIndex {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) {
    throw new Error('index.json must be an object');
  }
  if (parsed.$schema !== DISCOVERY_SCHEMA) {
    throw new Error(`Unexpected $schema: ${String(parsed.$schema)}`);
  }
  if (!Array.isArray(parsed.skills)) {
    throw new Error('index.json skills must be an array');
  }

  const skills: Array<SkillIndexEntry> = parsed.skills.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`skills[${index}] must be an object`);
    }

    const name = entry.name;
    const type = entry.type;
    const description = entry.description;
    const url = entry.url;
    const digest = entry.digest;

    if (typeof name !== 'string' || name.length === 0) {
      throw new Error(`skills[${index}].name must be a non-empty string`);
    }
    if (typeof type !== 'string' || type.length === 0) {
      throw new Error(`skills[${index}].type must be a non-empty string`);
    }
    if (typeof description !== 'string' || description.length === 0) {
      throw new Error(`skills[${index}].description must be a non-empty string`);
    }
    if (typeof url !== 'string' || url.length === 0) {
      throw new Error(`skills[${index}].url must be a non-empty string`);
    }
    if (typeof digest !== 'string' || digest.length === 0) {
      throw new Error(`skills[${index}].digest must be a non-empty string`);
    }

    return { description, digest, name, type, url };
  });

  return { $schema: DISCOVERY_SCHEMA, skills };
}

/** Parses the two required frontmatter fields without adding a YAML dependency. */
function parseRequiredFrontmatter(raw: string): { name: string; description: string } {
  if (!raw.startsWith('---\n')) {
    throw new Error('SKILL.md must start with YAML frontmatter');
  }

  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('SKILL.md frontmatter is not closed');
  }

  const block = raw.slice(4, end);
  let name: string | undefined;
  let description: string | undefined;

  for (const line of block.split('\n')) {
    if (line.startsWith('name:')) {
      name = line.slice('name:'.length).trim();
      continue;
    }
    if (line.startsWith('description:')) {
      description = line.slice('description:'.length).trim();
    }
  }

  if (!name || !description) {
    throw new Error('SKILL.md frontmatter requires name and description');
  }

  return { description, name };
}

function resolveSkillArtifactPath(url: string): string {
  if (url.includes('\\') || url.includes('%') || url.includes('..')) {
    throw new Error(`Unsafe skill url: ${url}`);
  }

  const pathname =
    url.startsWith('https://') || url.startsWith('http://') ? new URL(url).pathname : url;

  if (!pathname.startsWith('/.well-known/agent-skills/')) {
    throw new Error(`Skill url must stay under /.well-known/agent-skills/: ${url}`);
  }

  const artifactPath = resolve(publicDir, pathname.slice(1));
  const skillsRoot = resolve(skillsDir) + sep;
  if (artifactPath !== resolve(skillsDir) && !artifactPath.startsWith(skillsRoot)) {
    throw new Error(`Resolved skill path escapes skills directory: ${artifactPath}`);
  }

  return artifactPath;
}

function listSkillMdFiles(dir: string): Array<string> {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: Array<string> = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSkillMdFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name === 'SKILL.md') {
      files.push(fullPath);
    }
  }

  return files;
}

describe('agent skills discovery', () => {
  it('publishes a valid v0.2.0 index with matching skill artifacts', () => {
    expect(existsSync(indexPath)).toBe(true);

    const index = parseSkillIndex(readFileSync(indexPath, 'utf8'));
    expect(index.$schema).toBe(DISCOVERY_SCHEMA);
    expect(index.skills.length).toBeGreaterThan(0);

    const indexedArtifactPaths = new Set<string>();

    for (const skill of index.skills) {
      expect(skill.name).toMatch(SKILL_NAME_PATTERN);
      expect(skill.type).toBe('skill-md');
      expect(skill.description.length).toBeLessThanOrEqual(1024);
      expect(skill.digest).toMatch(DIGEST_PATTERN);

      const artifactPath = resolveSkillArtifactPath(skill.url);
      expect(existsSync(artifactPath)).toBe(true);
      indexedArtifactPaths.add(artifactPath);

      const artifactBytes = readFileSync(artifactPath);
      const digest = `sha256:${createHash('sha256').update(artifactBytes).digest('hex')}`;
      expect(digest).toBe(skill.digest);

      const frontmatter = parseRequiredFrontmatter(artifactBytes.toString('utf8'));
      expect(frontmatter.name).toBe(skill.name);
      expect(frontmatter.description).toBe(skill.description);
    }

    const skillMdFiles = listSkillMdFiles(skillsDir);
    for (const skillMdPath of skillMdFiles) {
      expect(indexedArtifactPaths.has(skillMdPath)).toBe(true);
    }

    expect(skillMdFiles.map((path) => relative(skillsDir, path)).sort()).toEqual(
      [...indexedArtifactPaths].map((path) => relative(skillsDir, path)).sort(),
    );
  });
});
