import 'server-only';

import { markdownPagePaths } from '@dg/shared-core/routes/app';
import { getPageMarkdown } from './getPageMarkdown';

const safePageMarkdown = async (pathname: string): Promise<string | null> => {
  try {
    return await getPageMarkdown(pathname);
  } catch {
    return null;
  }
};

/**
 * Builds `/llms-full.txt` by concatenating every registered Markdown page.
 */
export async function getLlmsFullTxt(): Promise<string> {
  const pages = await Promise.all(markdownPagePaths.map((path) => safePageMarkdown(path)));
  return pages.filter(Boolean).join('\n---\n\n');
}
