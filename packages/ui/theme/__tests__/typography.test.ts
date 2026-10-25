import { getGlobalThemeCss } from '../index';
import { getTypography, TYPOGRAPHY_ROLES } from '../typography';

describe('getTypography', () => {
  it('defines canonical role specs with display 700 and body 400/600 voices', () => {
    const typography = getTypography();

    expect(typography).toBe(TYPOGRAPHY_ROLES);
    expect(typography.label).toEqual({
      family: 'var(--display)',
      leading: 'var(--leading-tight)',
      size: 'var(--type-label)',
      tracking: 'var(--tracking-label)',
      weight: 700,
    });
    expect(typography.meta).toEqual({
      family: 'var(--body)',
      leading: 'var(--leading-meta)',
      size: 'var(--type-meta)',
      weight: 600,
    });
    expect(typography.caption).toEqual({
      family: 'var(--body)',
      leading: 'var(--leading-meta)',
      size: 'var(--type-caption)',
      weight: 600,
    });

    for (const spec of Object.values(typography)) {
      if (spec.family === 'var(--display)') {
        expect(spec.weight).toBe(700);
      } else if (spec.family === 'var(--body)') {
        expect([400, 600]).toContain(spec.weight);
      }
    }
  });

  it('emits valid CSS tokens, no root font-size staircase, and zero-specificity :where() link and color defaults in getGlobalThemeCss', () => {
    const css = getGlobalThemeCss();

    expect(css).not.toContain('undefined');
    expect(css).not.toContain('NaN');
    expect(css).not.toContain('font-size:');
    expect(css).toContain('font-variant-numeric: tabular-nums;');
    expect(css.indexOf(':where([data-typography][data-has-color])')).toBeGreaterThan(
      css.indexOf(':where([data-ui-link])'),
    );
  });
});
