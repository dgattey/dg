import 'server-only';

import { richTextToMarkdown } from '@dg/content-models/contentful/richTextToMarkdown';
import { homeRoute } from '@dg/shared-core/routes/app';
import {
  getCurrentLocation,
  getFooterLinks,
  getIntroContent,
  getProjects,
} from '../../services/contentful';
import { relatedPageLinksMarkdown } from '../llm-markdown/relatedPageLinksMarkdown';
import { HOMEPAGE_TITLE, SITE_NAME } from '../metadata';

const formatProjectTypes = (type: string | Array<string> | null | undefined): string | null => {
  if (!type) {
    return null;
  }
  return Array.isArray(type) ? type.join(', ') : type;
};

/**
 * Markdown representation of the homepage — kept next to Homepage UI.
 */
export async function getHomepageMarkdown(): Promise<string> {
  const [intro, projects, location, footerLinks] = await Promise.all([
    getIntroContent(),
    getProjects(),
    getCurrentLocation(),
    getFooterLinks(),
  ]);

  const sections: Array<string> = [`# ${SITE_NAME}`, `> ${HOMEPAGE_TITLE}`];

  if (intro) {
    const introMarkdown = richTextToMarkdown(intro.textBlock.content);
    if (introMarkdown) {
      sections.push('## About', introMarkdown);
    }
  }

  if (location) {
    sections.push(
      '## Location',
      `Current map location: ${location.point.latitude}, ${location.point.longitude}`,
    );
  }

  if (projects.length > 0) {
    sections.push(
      '## Projects',
      projects
        .map((project) => {
          const details = [
            formatProjectTypes(project.type),
            project.creationDate ? `created ${project.creationDate}` : null,
          ]
            .filter(Boolean)
            .join(' · ');
          const label = project.link ? `[${project.title}](${project.link.url})` : project.title;
          return details ? `- ${label}: ${details}` : `- ${label}`;
        })
        .join('\n'),
    );
  }

  if (footerLinks.length > 0) {
    sections.push(
      '## Links',
      footerLinks.map((link) => `- [${link.title}](${link.url})`).join('\n'),
    );
  }

  sections.push(relatedPageLinksMarkdown(homeRoute));
  return `${sections.join('\n\n')}\n`;
}
