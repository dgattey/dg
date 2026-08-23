import {
  FONT_DISPLAY_STACK,
  FONT_SANS_STACK,
  GREENHOUSE_TYPE_SCALE,
  getGreenhouseTypographyOverrides,
  getTypeCssVars,
} from '../typography';

describe('type tokens', () => {
  it('keeps display type on a system serif stack with no hosted font', () => {
    expect(FONT_DISPLAY_STACK).toMatch(/ui-serif/);
    expect(FONT_DISPLAY_STACK).toMatch(/serif/);
    expect(FONT_DISPLAY_STACK).not.toMatch(/url\(/);
    expect(FONT_DISPLAY_STACK).not.toMatch(/@font-face/);
  });

  it('defaults --font-display to the sans stack so flag-off headings stay put', () => {
    const vars = getTypeCssVars();
    expect(vars['--font-display']).toBe(FONT_SANS_STACK);
    expect(vars['--heading-font-variant']).toBe('all-small-caps');
  });

  it('names one greenhouse scale and puts sizes in clamp()', () => {
    const scale = getGreenhouseTypographyOverrides();
    expect(scale.h1?.fontFamily).toBe(FONT_DISPLAY_STACK);
    expect(scale.h1?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.h1);
    expect(scale.h3?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.h3);
    expect(scale.h5?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.h5);
    expect(scale.overline?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.overline);
    expect(scale.body1?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.body1);
    expect(scale.body2?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.body2);
    expect(scale.caption?.fontSize).toBe(GREENHOUSE_TYPE_SCALE.caption);
    expect(String(scale.h1?.fontSize)).toMatch(/clamp\(/);
    expect(scale.h1?.fontWeight).toBe(500);
    expect(scale.h3?.fontWeight).toBe(500);
    expect(scale.h5?.fontWeight).toBe(400);
    expect(scale.h5?.opacity).toBe(0.8);
    expect(scale.overline?.fontWeight).toBe(600);
    expect(scale.overline?.letterSpacing).toBe('0.12em');
    expect(scale.overline?.opacity).toBe(0.7);
    expect(scale.overline?.fontVariant).toBe('all-small-caps');
  });
});
