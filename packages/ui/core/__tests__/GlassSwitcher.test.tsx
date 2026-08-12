import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createGridStyles,
  createThumbStyles,
  GlassSwitcher,
  SPACING,
  spacingPx,
} from '../GlassSwitcher';

/**
 * Both breakpoint branches render at once — CSS decides which is visible — so
 * every query has to say which one it means.
 */
const desktop = () => within(document.querySelector('[data-role="glass-switcher"]') as HTMLElement);
const mobile = () =>
  within(document.querySelector('[data-role="glass-switcher-mobile"]') as HTMLElement);

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

    const group = desktop().getByRole('radiogroup', { name: 'Example switcher' });
    expect(group).toBeInTheDocument();

    const radios = desktop().getAllByRole('radio', { hidden: true });
    expect(radios).toHaveLength(2);
    const firstRadio = radios[0];
    const secondRadio = radios[1];
    if (!firstRadio || !secondRadio) {
      throw new Error('Expected two radio options');
    }
    expect(firstRadio).toBeChecked();

    await user.click(secondRadio);
    expect(handleChange).toHaveBeenCalledWith('second');

    // Hidden until hover or keyboard focus reveals it, which CSS alone does
    expect(screen.getAllByRole('tooltip', { hidden: true })).toHaveLength(1);
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

    expect(desktop().getByText('Recently added')).toBeInTheDocument();
    expect(desktop().getByText('Album')).toBeInTheDocument();
    expect(screen.queryAllByRole('tooltip', { hidden: true })).toHaveLength(0);
    expect(screen.getByTestId('mobile-icon')).toBeInTheDocument();

    await user.click(desktop().getByRole('radio', { hidden: true, name: 'Album' }));
    expect(handleChange).toHaveBeenCalledWith('album');
  });
});

describe('GlassSwitcher mobile disclosure', () => {
  const renderSwitcher = (onChange = jest.fn()) => {
    render(
      <GlassSwitcher
        aria-label="Sort albums"
        mobileIcon={<span data-testid="mobile-icon" />}
        onChange={onChange}
        options={[
          { label: 'Recently added', value: 'added' },
          { label: 'Album', value: 'album' },
        ]}
        value="added"
      />,
    );
    return { onChange, trigger: mobile().getByRole('button', { name: 'Sort albums' }) };
  };

  it('opens the shared glass panel instead of a MUI menu', async () => {
    const user = userEvent.setup();
    const { trigger } = renderSwitcher();

    // The old implementation portalled a MUI menu to the body
    expect(document.querySelector('.MuiMenu-root')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const panel = mobile().getByRole('radiogroup', { hidden: true });
    expect(panel).toHaveAttribute('inert');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('inert');
    expect(panel).toHaveAccessibleName('Sort albums');
  });

  it('keeps the selected sort option programmatically identifiable', async () => {
    const user = userEvent.setup();
    const { onChange, trigger } = renderSwitcher();
    await user.click(trigger);

    const radios = mobile().getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(mobile().getByRole('radio', { name: 'Recently added' })).toBeChecked();
    expect(mobile().getByRole('radio', { name: 'Album' })).not.toBeChecked();

    await user.click(mobile().getByRole('radio', { name: 'Album' }));
    expect(onChange).toHaveBeenCalledWith('album');
  });

  it('closes on selection and on Escape, returning focus to the trigger', async () => {
    const user = userEvent.setup();
    const { trigger } = renderSwitcher();

    await user.click(trigger);
    await user.click(mobile().getByRole('radio', { name: 'Album' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('gives the two branches separate native radio groups', () => {
    renderSwitcher();

    const nameOf = (input: Element) => input.getAttribute('name');
    const desktopNames = new Set(desktop().getAllByRole('radio', { hidden: true }).map(nameOf));
    const mobileNames = new Set(mobile().getAllByRole('radio', { hidden: true }).map(nameOf));

    expect(desktopNames.size).toBe(1);
    expect(mobileNames.size).toBe(1);
    expect([...desktopNames][0]).not.toBe([...mobileNames][0]);
  });
});
