import 'server-only';

import {
  homeRoute,
  htmlPathToMarkdownPath,
  llmsFullTxtRoute,
  markdownPages,
} from '@dg/shared-core/routes/app';
import { HOMEPAGE_TITLE, SITE_NAME } from '../../app/metadata';
import { getHomepageDescription } from '../homepage';
import { absoluteUrl } from './siteUrl';

/**
 * Builds the curated `/llms.txt` index for AI tools from the page registry.
 */
export async function getLlmsTxt(): Promise<string> {
  const description = (await getHomepageDescription()) ?? `${SITE_NAME} — ${HOMEPAGE_TITLE}`;

  const pageLinks = markdownPages
    .map((page) => {
      const mdPath = htmlPathToMarkdownPath(page.path);
      if (!mdPath) {
        return null;
      }
      return `- [${page.title}](${absoluteUrl(mdPath)}): ${page.summary}`;
    })
    .filter(Boolean)
    .join('\n');

  return `# ${SITE_NAME}

> ${description}

Personal site for ${SITE_NAME}: projects, current location, and listening history.
Prefer the \`.md\` links below for clean, token-efficient content.

## Pages

${pageLinks}

## Optional

- [Full site Markdown](${absoluteUrl(llmsFullTxtRoute)}): All public pages in one file
- [HTML home](${absoluteUrl(homeRoute)}): Human-oriented homepage
`;
}
