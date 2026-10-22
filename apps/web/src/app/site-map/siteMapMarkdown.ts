import 'server-only';

import { siteMapRoute } from '@dg/shared-core/routes/app';
import { getFooterLinks, getSideProjects } from '../../services/contentful';
import { formatElsewhereHandle } from '../layouts/Footer';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { SITE_NAME } from '../metadata';
import {
  DEFAULT_ELSEWHERE_LINKS,
  SITE_MAP_AGENT_SURFACES,
  SITE_MAP_APPS,
  SITE_MAP_PAGES,
} from './siteMapCatalog';

export async function getSiteMapMarkdown(): Promise<string> {
  const [sideProjects, footerLinks] = await Promise.all([
    getSideProjects().catch(() => []),
    getFooterLinks().catch(() => []),
  ]);

  const byHost = new Map(
    sideProjects.map((project) => {
      try {
        return [new URL(project.url).hostname, project] as const;
      } catch {
        return [project.url, project] as const;
      }
    }),
  );

  const apps = SITE_MAP_APPS.map((entry) => {
    const live = byHost.get(entry.domain);
    return {
      description: live?.description || entry.description,
      href: live?.url || entry.href,
      label: live?.title || entry.label,
    };
  });

  const externalLinks =
    footerLinks.filter((l) => l.icon !== 'email' && !l.url.startsWith('mailto:')).length > 0
      ? footerLinks
          .filter((l) => l.icon !== 'email' && !l.url.startsWith('mailto:'))
          .map((link) => ({
            description: formatElsewhereHandle(link.url),
            href: link.url,
            label: link.title === 'Github' ? 'GitHub' : link.title,
          }))
      : DEFAULT_ELSEWHERE_LINKS;

  const sections: Array<string> = [
    '# Site map',
    `> Complete directory of pages, agent and API endpoints, side projects, and external links on ${SITE_NAME} (dylangattey.com).`,
    '## Pages',
    SITE_MAP_PAGES.map(
      (page) =>
        `- **[${page.label}](${page.path})** (\`${page.path}\`, [Markdown](${page.markdownPath})): ${page.description}`,
    ).join('\n'),
    '## Agent and API surfaces',
    SITE_MAP_AGENT_SURFACES.map(
      (surface) =>
        `- **[${surface.label}](${surface.href})** (\`${surface.href}\` · ${surface.badge}): ${surface.description}`,
    ).join('\n'),
    "## Dylan's apps",
    apps.map((app) => `- **[${app.label}](${app.href})**: ${app.description}`).join('\n'),
    '## Elsewhere',
    externalLinks
      .map((link) => `- **[${link.label}](${link.href})** (\`${link.description}\`)`)
      .join('\n'),
    relatedPageLinksMarkdown(siteMapRoute),
  ];

  return `${sections.join('\n\n')}\n`;
}
