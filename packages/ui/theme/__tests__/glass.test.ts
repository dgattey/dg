import { GLASS_BACKDROP_FILTER_DEFAULT, GLASS_BG_MATTE, getGlassCssVars } from '../glass';

describe('glass tokens', () => {
  it('defaults to frosted glass so existing surfaces stay unchanged', () => {
    const vars = getGlassCssVars();
    expect(vars['--glass-backdrop-filter']).toBe(GLASS_BACKDROP_FILTER_DEFAULT);
    expect(vars['--glass-bg']).toContain('70%');
  });

  it('exposes a matte mix that does not use backdrop-filter', () => {
    expect(GLASS_BG_MATTE).toContain('background-paper');
    expect(GLASS_BG_MATTE).not.toContain('blur(');
  });
});
