import {
  htmlPathToMarkdownPath,
  type MarkdownPagePath,
  markdownPages,
} from '@dg/shared-core/routes/app';

/** Footer links to other registered Markdown pages + llms.txt. */
export function relatedPageLinksMarkdown(currentPath: MarkdownPagePath): string {
  const links = markdownPages
    .filter((page) => page.path !== currentPath)
    .map((page) => `- [${page.title}](${htmlPathToMarkdownPath(page.path)}): ${page.summary}`);

  return ['## More', ...links, `- [llms.txt](/llms.txt): Curated map of LLM-friendly pages`].join(
    '\n',
  );
}
