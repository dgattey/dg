import { render, screen } from '@testing-library/react';
import { Disc3, Sun } from 'lucide-react';
import { EASING_BOUNCY, TIMING_BOUNCY, TIMING_NORMAL } from '../../helpers/timing';
import { GlassDisclosurePanel, GlassDisclosureRow } from '../GlassDisclosurePanel';

/** The emitted rule for a panel, which is where its transition actually lives. */
function panelRule(panel: HTMLElement): string {
  const rules = [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .filter((rule) => [...panel.classList].some((name) => rule.includes(`.${name}`)));
  return rules.join('\n');
}

describe('GlassDisclosurePanel', () => {
  it('renders a shared glass surface with row chrome', () => {
    render(
      <GlassDisclosurePanel isOpen label="Test menu" role="menu">
        <GlassDisclosureRow icon={<Sun />} label="Light" />
        <GlassDisclosureRow icon={<Disc3 />} label="Music" />
      </GlassDisclosurePanel>,
    );

    expect(screen.getByRole('menu', { name: 'Test menu' })).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('marks the panel inert while closed', () => {
    render(
      <GlassDisclosurePanel isOpen={false} label="Closed menu">
        <GlassDisclosureRow icon={<Sun />} label="Hidden" />
      </GlassDisclosurePanel>,
    );

    expect(screen.getByLabelText('Closed menu')).toHaveAttribute('inert');
  });

  /**
   * The spring was previously crammed into 300ms and applied to opacity too,
   * which read as a stutter rather than the bounce the cards get.
   */
  it('springs the transform over the full bouncy duration, easing opacity separately', () => {
    render(
      <GlassDisclosurePanel isOpen label="Open menu" role="menu">
        <GlassDisclosureRow icon={<Sun />} label="Light" />
      </GlassDisclosurePanel>,
    );

    const rule = panelRule(screen.getByRole('menu', { name: 'Open menu' }));

    expect(rule).toContain(`transform ${TIMING_BOUNCY}ms ${EASING_BOUNCY}`);
    expect(rule).toContain(`opacity ${TIMING_NORMAL}ms`);
    // A spring overshoots, and opacity clamps at 1, so it must not get the curve
    expect(rule).not.toContain(`opacity ${TIMING_NORMAL}ms ${EASING_BOUNCY}`);
    // A stray longhand would restyle every property in the shorthand above it
    expect(rule).not.toContain('transition-timing-function');
  });

  /**
   * `visibility` is what takes a closed panel out of the tab order, so it has to
   * flip once the panel is invisible rather than waiting out the longer transform.
   */
  it('delays hiding by the fade duration, not the transform duration', () => {
    render(
      <GlassDisclosurePanel isOpen={false} label="Closing menu">
        <GlassDisclosureRow icon={<Sun />} label="Light" />
      </GlassDisclosurePanel>,
    );

    const rule = panelRule(screen.getByLabelText('Closing menu'));

    expect(rule).toContain(`visibility 0s linear ${TIMING_NORMAL}ms`);
    expect(rule).not.toContain(`visibility 0s linear ${TIMING_BOUNCY}ms`);
  });

  it('pins the panel to either trigger edge', () => {
    const { rerender } = render(
      <GlassDisclosurePanel isOpen label="Panel">
        <GlassDisclosureRow icon={<Disc3 />} label="Music" />
      </GlassDisclosurePanel>,
    );
    expect(panelRule(screen.getByLabelText('Panel'))).toContain('inset-inline-end: 0');

    rerender(
      <GlassDisclosurePanel align="start" isOpen label="Panel">
        <GlassDisclosureRow icon={<Disc3 />} label="Music" />
      </GlassDisclosurePanel>,
    );
    expect(panelRule(screen.getByLabelText('Panel'))).toContain('inset-inline-start: 0');
  });

  it('drops the icon cell for text-only rows', () => {
    render(
      <GlassDisclosurePanel isOpen label="Sort">
        <GlassDisclosureRow label="Recently added" />
      </GlassDisclosurePanel>,
    );

    const row = screen.getByText('Recently added').parentElement as HTMLElement;
    expect(panelRule(row)).toContain('grid-template-columns: 1fr');
  });
});
