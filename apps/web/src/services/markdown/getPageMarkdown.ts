import 'server-only';

import { richTextToMarkdown } from '@dg/content-models/contentful/richTextToMarkdown';
import {
  getMarkdownPage,
  homeRoute,
  htmlPathToMarkdownPath,
  isMarkdownPagePath,
  type MarkdownPagePath,
  markdownPages,
  musicRoute,
} from '@dg/shared-core/routes/app';
import { HOMEPAGE_TITLE, SITE_NAME } from '../../app/metadata';
import { getCurrentLocation, getFooterLinks, getIntroContent, getProjects } from '../contentful';
import { getMusicHistory } from '../music';

const formatProjectTypes = (type: string | Array<string> | null | undefined): string | null => {
  if (!type) {
    return null;
  }
  return Array.isArray(type) ? type.join(', ') : type;
};

const moreLinksMarkdown = (currentPath: MarkdownPagePath): string => {
  const otherPages = markdownPages
    .filter((page) => page.path !== currentPath)
    .map((page) => {
      const mdPath = htmlPathToMarkdownPath(page.path);
      return mdPath ? `- [${page.title}](${mdPath}): ${page.summary}` : null;
    })
    .filter(Boolean);

  return [
    '## More',
    ...otherPages,
    `- [llms.txt](/llms.txt): Curated map of LLM-friendly pages`,
  ].join('\n');
};

async function getHomepageMarkdown(): Promise<string> {
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
    const projectLines = projects.map((project) => {
      const details = [
        formatProjectTypes(project.type),
        project.creationDate ? `created ${project.creationDate}` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      const label = project.link ? `[${project.title}](${project.link.url})` : project.title;
      return details ? `- ${label}: ${details}` : `- ${label}`;
    });
    sections.push('## Projects', projectLines.join('\n'));
  }

  if (footerLinks.length > 0) {
    sections.push(
      '## Links',
      footerLinks.map((link) => `- [${link.title}](${link.url})`).join('\n'),
    );
  }

  sections.push(moreLinksMarkdown(homeRoute));

  return `${sections.join('\n\n')}\n`;
}

async function getMusicMarkdown(): Promise<string> {
  const { tracks } = await getMusicHistory({});
  const page = getMarkdownPage(musicRoute);
  const sections: Array<string> = [`# ${page.title}`, `> ${page.summary} from ${SITE_NAME}`];

  if (tracks.length === 0) {
    sections.push('No recent plays available.');
  } else {
    const lines = tracks.map((track) => {
      const playedAt = new Date(track.playedAt).toISOString();
      return `- [${track.trackName}](${track.url}) — ${track.artistNames} (${track.albumName}), played ${playedAt}`;
    });
    sections.push('## Recent plays', lines.join('\n'));
  }

  sections.push(moreLinksMarkdown(musicRoute));

  return `${sections.join('\n\n')}\n`;
}

/**
 * Per-page Markdown generators. TypeScript requires every registry path
 * to have an entry — that is the main guardrail when adding pages.
 */
export const pageMarkdownGenerators: {
  [Path in MarkdownPagePath]: () => Promise<string>;
} = {
  [homeRoute]: getHomepageMarkdown,
  [musicRoute]: getMusicMarkdown,
};

/**
 * Returns Markdown for a public page path, or null when the path has no twin.
 */
export function getPageMarkdown(pathname: string): Promise<string | null> {
  if (!isMarkdownPagePath(pathname)) {
    return Promise.resolve(null);
  }
  return pageMarkdownGenerators[pathname]();
}
