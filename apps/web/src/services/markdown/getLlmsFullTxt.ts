import 'server-only';

import { homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { getPageMarkdown } from './getPageMarkdown';

const safePageMarkdown = async (pathname: string): Promise<string | null> => {
  try {
    return await getPageMarkdown(pathname);
  } catch {
    return null;
  }
};

/**
 * Builds `/llms-full.txt` by concatenating public Markdown pages.
 */
export async function getLlmsFullTxt(): Promise<string> {
  const [home, music] = await Promise.all([
    safePageMarkdown(homeRoute),
    safePageMarkdown(musicRoute),
  ]);

  return [home, music].filter(Boolean).join('\n---\n\n');
}
