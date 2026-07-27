import { htmlPathToMarkdownPath, isMarkdownPagePath, markdownPathToHtmlPath } from '../app';

describe('markdown route helpers', () => {
  it('maps html paths to .md twins', () => {
    expect(htmlPathToMarkdownPath('/')).toBe('/index.md');
    expect(htmlPathToMarkdownPath('/music')).toBe('/music.md');
    expect(htmlPathToMarkdownPath('/dev-console')).toBeNull();
  });

  it('maps .md paths back to html', () => {
    expect(markdownPathToHtmlPath('/index.md')).toBe('/');
    expect(markdownPathToHtmlPath('/music.md')).toBe('/music');
    expect(markdownPathToHtmlPath('/about.md')).toBeNull();
  });

  it('identifies markdown-capable pages', () => {
    expect(isMarkdownPagePath('/')).toBe(true);
    expect(isMarkdownPagePath('/music')).toBe(true);
    expect(isMarkdownPagePath('/dev-console')).toBe(false);
  });
});
