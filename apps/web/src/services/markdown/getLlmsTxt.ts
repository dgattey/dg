import 'server-only';

import {
  homeRoute,
  htmlPathToMarkdownPath,
  llmsFullTxtRoute,
  musicRoute,
} from '@dg/shared-core/routes/app';
import { HOMEPAGE_TITLE, SITE_NAME } from '../../app/metadata';
import { getHomepageDescription } from '../homepage';
import { absoluteUrl } from './siteUrl';

/**
 * Builds the curated `/llms.txt` index for AI tools.
 */
export async function getLlmsTxt(): Promise<string> {
  const description = (await getHomepageDescription()) ?? `${SITE_NAME} — ${HOMEPAGE_TITLE}`;
  const homeMarkdown = htmlPathToMarkdownPath(homeRoute);
  const musicMarkdown = htmlPathToMarkdownPath(musicRoute);

  return `# ${SITE_NAME}

> ${description}

Personal site for ${SITE_NAME}: projects, current location, and listening history.
Prefer the \`.md\` links below for clean, token-efficient content.

## Pages

- [Home](${absoluteUrl(homeMarkdown ?? '/index.md')}): About, projects, location, and links
- [Listening history](${absoluteUrl(musicMarkdown ?? '/music.md')}): Recent Spotify plays

## Optional

- [Full site Markdown](${absoluteUrl(llmsFullTxtRoute)}): Homepage and music content in one file
- [HTML home](${absoluteUrl(homeRoute)}): Human-oriented homepage
`;
}
