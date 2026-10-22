import 'server-only';

import { siteMapRoute } from '@dg/shared-core/routes/app';
import { getSideProjects } from '../../services/contentful';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';
import { SITE_MAP_AGENT_SURFACES, SITE_MAP_PAGES } from './siteMapCatalog';

export async function getSiteMapMarkdown(): Promise<string> {
  const sideProjects = await getSideProjects().catch(() => []);

  const sections: Array<string> = [
    '# Site map',
    `> All pages, side projects, and machine-readable endpoints on ${SITE_NAME}.`,
    '## Pages',
    SITE_MAP_PAGES.map(
      (page) =>
        `- **[${page.label}](${page.path})** (\`${page.path}\`, [Markdown](${page.markdownPath})): ${page.description}`,
    ).join('\n'),
  ];

  if (sideProjects.length > 0) {
    sections.push(
      '## Side projects',
      sideProjects
        .map((project) => `- **[${project.title}](${project.url})**: ${project.description}`)
        .join('\n'),
    );
  }

  sections.push(
    '## Agent and API surfaces',
    SITE_MAP_AGENT_SURFACES.map(
      (surface) =>
        `- **[${surface.label}](${surface.href})** (\`${surface.href}\` · ${surface.badge}): ${surface.description}`,
    ).join('\n'),
    relatedPageLinksMarkdown(siteMapRoute),
  );

  return `${sections.join('\n\n')}\n`;
}
