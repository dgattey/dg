import { compileSx } from '../css';

describe('compileSx', () => {
  it('expands marginX, marginY, paddingX, and paddingY spacing shorthands', () => {
    const compiled = compileSx({
      marginX: -3,
      marginY: 2,
      paddingX: 3,
      paddingY: 1,
    });

    expect(compiled?.css).toContain('margin-inline: -24px;');
    expect(compiled?.css).toContain('margin-block: 16px;');
    expect(compiled?.css).toContain('padding-inline: 24px;');
    expect(compiled?.css).toContain('padding-block: 8px;');
  });

  it('replaces breakpoint objects when overridden by a later sx item instead of merging scalar characters', () => {
    const compiled = compileSx([
      { fontSize: { lg: '1.0625rem', sm: '1rem', xs: '1.03125rem' } },
      { fontSize: '0.85rem' },
    ]);

    expect(compiled?.css).toContain('font-size: 0.85rem;');
    expect(compiled?.css).not.toContain('1.0625rem');
  });

  it('formats Webkit vendor-prefixed properties with a single leading dash', () => {
    const compiled = compileSx({
      WebkitFontSmoothing: 'auto',
    });

    expect(compiled?.css).toContain('-webkit-font-smoothing: auto;');
    expect(compiled?.css).not.toContain('--webkit-font-smoothing');
  });
});
