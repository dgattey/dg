import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createGridStyles,
  createThumbStyles,
  GlassSwitcher,
  SPACING,
  spacingPx,
} from '../GlassSwitcher';

describe('GlassSwitcher layout (thumb/grid sync)', () => {
  const groupPadding = spacingPx(SPACING.groupPadding);
  const gap = spacingPx(SPACING.thumbGap);
  const optionHeight = spacingPx(SPACING.optionMinHeight);
  const paddingBlock = spacingPx(SPACING.optionPaddingBlock);
  const rowHeight = `calc(${optionHeight} + (${paddingBlock} * 2))`;

  it('uses same groupPadding in thumb and grid', () => {
    const thumb = createThumbStyles(3, 0);
    const grid = createGridStyles(3);

    expect(thumb.left?.sm).toBe(groupPadding);
    expect(thumb.top?.xs as string).toContain(groupPadding);
    expect(grid.padding).toBe(groupPadding);
  });

  it('thumb horizontal width accounts for 2*groupPadding (content area inset)', () => {
    const thumb = createThumbStyles(3, 0);
    const widthSm = thumb.width?.sm as string;

    expect(widthSm).toContain(`2*${groupPadding}`);
    expect(widthSm).toContain(gap);
  });

  it('thumb vertical top includes groupPadding and rowHeight', () => {
    const thumb = createThumbStyles(3, 1);
    const topXs = thumb.top?.xs as string;

    expect(topXs).toContain(groupPadding);
    expect(topXs).toContain(rowHeight);
    expect(topXs).toContain(gap);
  });

  it('grid uses same rowHeight and gap as thumb', () => {
    const thumb = createThumbStyles(2, 0);
    const grid = createGridStyles(2);

    expect((grid.gridTemplateRows as { xs?: string })?.xs).toContain(rowHeight);
    expect((grid.rowGap as { xs?: string })?.xs).toBe(gap);
    expect((grid.columnGap as { sm?: string })?.sm).toBe(gap);
    expect(thumb.top?.xs as string).toContain(rowHeight);
  });
});

describe('GlassSwitcher', () => {
  it('renders options and emits changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <GlassSwitcher
        aria-label="Example switcher"
        onChange={handleChange}
        options={[
          { icon: <span>1</span>, label: 'First', value: 'first' },
          { icon: <span>2</span>, label: '', value: 'second' },
        ]}
        value="first"
      />,
    );

    const group = screen.getByRole('radiogroup', { name: 'Example switcher' });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio', { hidden: true });
    expect(radios).toHaveLength(2);
    const firstRadio = radios[0];
    const secondRadio = radios[1];
    if (!firstRadio || !secondRadio) {
      throw new Error('Expected two radio options');
    }
    expect(firstRadio).toBeChecked();

    await user.click(secondRadio);
    expect(handleChange).toHaveBeenCalledWith('second');

    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  });
});
