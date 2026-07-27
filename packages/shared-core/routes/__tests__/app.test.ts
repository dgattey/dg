import {
  htmlPathToInternalMarkdownPath,
  htmlPathToMarkdownPath,
  isMarkdownPagePath,
  markdownPagePaths,
  markdownPages,
  markdownPathToHtmlPath,
} from '../app';

describe('markdown page registry', () => {
  it('maps html paths to .md twins by convention', () => {
    expect(htmlPathToMarkdownPath('/')).toBe('/index.md');
    expect(htmlPathToMarkdownPath('/music')).toBe('/music.md');
    expect(htmlPathToMarkdownPath('/dev-console')).toBeNull();
  });

  it('maps .md paths back to html', () => {
    expect(markdownPathToHtmlPath('/index.md')).toBe('/');
    expect(markdownPathToHtmlPath('/music.md')).toBe('/music');
    expect(markdownPathToHtmlPath('/about.md')).toBeNull();
  });

  it('maps html paths to the internal markdown handler', () => {
    expect(htmlPathToInternalMarkdownPath('/')).toBe('/llm-markdown');
    expect(htmlPathToInternalMarkdownPath('/music')).toBe('/llm-markdown/music');
  });

  it('keeps path helpers and registry entries aligned', () => {
    expect(markdownPagePaths).toEqual(markdownPages.map((page) => page.path));
    for (const path of markdownPagePaths) {
      expect(isMarkdownPagePath(path)).toBe(true);
      expect(markdownPathToHtmlPath(htmlPathToMarkdownPath(path) ?? '')).toBe(path);
    }
  });
});
