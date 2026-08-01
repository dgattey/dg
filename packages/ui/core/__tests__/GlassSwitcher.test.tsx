import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createGridStyles,
  createThumbStyles,
  GlassSwitcher,
  SPACING,
  spacingPx,
} from '../GlassSwitcher';

/** Shape expected from createThumbStyles for assertions (SxObject union blocks direct access). */
type ThumbStyleShape = {
  left?: string;
  width?: string;
};

/** Shape expected from createGridStyles for assertions (SxObject union blocks direct access). */
type GridStyleShape = {
  columnGap?: string;
  padding?: string;
};

describe('GlassSwitcher layout (thumb/grid sync)', () => {
  const groupPadding = spacingPx(SPACING.groupPadding);
  const gap = spacingPx(SPACING.thumbGap);

  it('uses same groupPadding in thumb and grid', () => {
    const thumb = createThumbStyles(3, 0) as ThumbStyleShape;
    const grid = createGridStyles(3) as GridStyleShape;

    expect(thumb.left).toBe(groupPadding);
    expect(grid.padding).toBe(groupPadding);
  });

  it('thumb horizontal width accounts for 2*groupPadding (content area inset)', () => {
    const thumb = createThumbStyles(3, 0) as ThumbStyleShape;
    const width = thumb.width as string;

    expect(width).toContain(`2*${groupPadding}`);
    expect(width).toContain(gap);
  });

  it('grid uses same gap as thumb', () => {
    const grid = createGridStyles(2) as GridStyleShape;

    expect(grid.columnGap).toBe(gap);
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

  it('renders visible labels without tooltips for text-only options', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <GlassSwitcher
        aria-label="Sort things"
        mobileIcon={<span data-testid="mobile-icon" />}
        onChange={handleChange}
        options={[
          { label: 'Recently added', value: 'added' },
          { label: 'Album', value: 'album' },
        ]}
        value="added"
      />,
    );

    expect(screen.getByText('Recently added')).toBeInTheDocument();
    expect(screen.getByText('Album')).toBeInTheDocument();
    expect(screen.queryAllByRole('tooltip')).toHaveLength(0);
    expect(screen.getByTestId('mobile-icon')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { hidden: true, name: 'Album' }));
    expect(handleChange).toHaveBeenCalledWith('album');
  });
});
