import {
  albumRoute,
  apiCatalogRoute,
  apiOpenApiRoute,
  apiStatusRoute,
  favoriteAlbumsRoute,
  htmlPathToInternalMarkdownPath,
  htmlPathToMarkdownPath,
  isMarkdownPagePath,
  markdownPagePaths,
  markdownPages,
  markdownPathToHtmlPath,
  tryHtmlPathToMarkdownPath,
} from '../app';

describe('markdown page registry', () => {
  it('maps html paths to .md twins by convention', () => {
    expect(htmlPathToMarkdownPath('/')).toBe('/index.md');
    expect(htmlPathToMarkdownPath('/music')).toBe('/music.md');
    expect(htmlPathToMarkdownPath('/music/albums')).toBe('/music/albums.md');
    expect(tryHtmlPathToMarkdownPath('/dev-console')).toBeNull();
  });

  it('maps .md paths back to html', () => {
    expect(markdownPathToHtmlPath('/index.md')).toBe('/');
    expect(markdownPathToHtmlPath('/music.md')).toBe('/music');
    expect(markdownPathToHtmlPath('/music/albums.md')).toBe('/music/albums');
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
      expect(markdownPathToHtmlPath(htmlPathToMarkdownPath(path))).toBe(path);
    }
  });

  it('keeps well-known machine documents out of the page registry', () => {
    expect(markdownPagePaths).not.toEqual(
      expect.arrayContaining([apiCatalogRoute, apiOpenApiRoute, apiStatusRoute]),
    );
  });

  it('builds album detail routes under favorite albums', () => {
    expect(albumRoute('abc123')).toBe(`${favoriteAlbumsRoute}?album=abc123`);
  });
});
