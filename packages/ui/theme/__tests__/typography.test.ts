import { getGlobalThemeCss } from '../index';
import { getTypography } from '../typography';

describe('getTypography', () => {
  it('returns the bumped shared label and meta sizes for button, overline, and caption', () => {
    const typography = getTypography();

    expect(typography.button).toEqual({
      fontSize: 'clamp(18px, 1.6vw, 20px)',
      fontWeight: 600,
    });
    expect(typography.overline).toEqual({
      fontSize: 16,
      fontWeight: 600,
    });
    expect(typography.caption).toEqual({
      fontSize: 15,
      fontWeight: 400,
    });
  });

  it('emits valid CSS units, no undefined tokens, and zero-specificity :where() defaults in getGlobalThemeCss', () => {
    const css = getGlobalThemeCss();

    expect(css).not.toContain('undefined');
    expect(css).not.toContain('NaN');

    const fontSizes = [...css.matchAll(/font-size:\s*([^;}\n]+)/g)].map((m) => m[1]?.trim() ?? '');
    expect(fontSizes.length).toBeGreaterThan(0);
    for (const size of fontSizes) {
      expect(size).toMatch(/^(?:\d+(?:\.\d+)?(?:px|rem|em)|clamp\(.+\)|inherit)$/);
    }

    expect(css).toContain(':where([data-typography="caption"]) { font-size: 15px;');
    expect(css).toContain(':where([data-typography="overline"]) { font-size: 16px;');
    expect(css).toContain(
      ':where([data-typography="h6"]) { color: var(--dg-palette-text-h6); font-size: 16px;',
    );
    expect(css.indexOf(':where([data-typography][data-has-color])')).toBeGreaterThan(
      css.indexOf(':where([data-ui-link])'),
    );
  });
});
