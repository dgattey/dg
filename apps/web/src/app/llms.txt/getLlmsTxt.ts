import 'server-only';

import {
  homeRoute,
  htmlPathToMarkdownPath,
  llmsFullTxtRoute,
  markdownPages,
} from '@dg/shared-core/routes/app';
import { getHomepageDescription } from '../../services/homepage';
import { HOMEPAGE_TITLE, metadataBase, SITE_NAME } from '../metadata';

const absoluteUrl = (pathname: string) => new URL(pathname, metadataBase).toString();

/** Curated `/llms.txt` index from the page registry. */
export async function getLlmsTxt(): Promise<string> {
  const description = (await getHomepageDescription()) ?? `${SITE_NAME} — ${HOMEPAGE_TITLE}`;
  const pageLinks = markdownPages
    .map(
      (page) =>
        `- [${page.title}](${absoluteUrl(htmlPathToMarkdownPath(page.path))}): ${page.summary}`,
    )
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
