import 'server-only';

import { markdownPagePaths } from '@dg/shared-core/routes/app';
import { getPageMarkdown } from '../llm-markdown/pageMarkdown';

/** `/llms-full.txt` — every registered Markdown page concatenated. */
export async function getLlmsFullTxt(): Promise<string> {
  const pages = await Promise.all(
    markdownPagePaths.map(async (path) => {
      try {
        return await getPageMarkdown(path);
      } catch {
        return null;
      }
    }),
  );
  return pages.filter(Boolean).join('\n---\n\n');
}
