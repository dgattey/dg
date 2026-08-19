import { FONT_DISPLAY_STACK, FONT_SANS_STACK, getTypeCssVars } from '../typography';

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
});
