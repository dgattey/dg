/**
 * @jest-environment jsdom
 */

import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { render, screen } from '@testing-library/react';
import type { SlottedProject } from '../assignProjectSlots';
import { MoreWorkSheet } from '../MoreWorkSheet';
import type { ProjectFrameStyle } from '../workSheetFrames';

jest.mock('../../home/ProjectCard', () => ({
  ProjectCard: ({
    title,
    surface,
    style,
    'data-slot': dataSlot,
  }: {
    title: string;
    surface?: string;
    style?: ProjectFrameStyle;
    'data-slot'?: string;
  }) => (
    <div
      data-has-style={style ? 'true' : 'false'}
      data-slot={dataSlot}
      data-surface={surface}
      data-testid="project-card"
    >
      {title}
    </div>
  ),
}));

jest.mock('../CutOut', () => ({
  CutOut: ({ placement }: { placement: { id: string } }) => (
    <div aria-hidden="true" data-cut-out={placement.id} />
  ),
}));

jest.mock('../TornField', () => ({
  TornField: ({ className }: { className?: string }) => (
    <div aria-hidden="true" className={className} data-testid="torn-field" />
  ),
}));

const slotted = (
  sourceIndex: number,
  title: string,
): SlottedProject => ({
  key: `p-${sourceIndex}`,
  project: {
    link: { icon: null, title, url: `https://example.com/${title}` },
    thumbnail: { height: 400, url: `https://images.test/${title}.jpg`, width: 900 },
    title,
  } satisfies RenderableProject,
});

describe('MoreWorkSheet', () => {
  it('renders primary slots in v16 DOM order with layout markers', () => {
    render(
      <MoreWorkSheet
        overflow={[]}
        projects={[
          slotted(2, 'Merge'),
          slotted(3, 'Canal'),
          slotted(4, 'Jump'),
          slotted(5, 'Genera'),
        ]}
        sites={<div data-slot="sd" data-testid="sites-node" />}
      />,
    );

    expect(screen.getByRole('region', { name: 'More work' })).toBeInTheDocument();
    const grid = screen.getByTestId('sites-node').parentElement;
    expect(grid?.children[0]).toHaveAttribute('data-slot', 'mg');
    expect(grid?.children[1]).toHaveAttribute('data-slot', 'sd');
    expect(grid?.children[2]).toHaveAttribute('data-slot', 'cn');
    expect(grid?.children[3]).toHaveAttribute('data-slot', 'js');
    expect(grid?.children[4]).toHaveAttribute('data-slot', 'gn');
    expect(screen.getByTestId('torn-field')).toBeInTheDocument();
  });

  it('omits the side-projects slot when sites are missing', () => {
    const { container } = render(
      <MoreWorkSheet overflow={[]} projects={[slotted(2, 'Merge')]} sites={null} />,
    );

    expect(screen.queryByTestId('sites-node')).not.toBeInTheDocument();
    expect(screen.getByTestId('project-card')).toHaveAttribute('data-slot', 'mg');
    expect(container.querySelector('[data-slot="sd"]')).not.toBeInTheDocument();
  });

  it('renders overflow units with unique reduced cut-out keys', () => {
    const { container } = render(
      <MoreWorkSheet
        overflow={[
          {
            key: 'overflow-0',
            projects: [slotted(7, 'Eight'), slotted(8, 'Nine')],
          },
        ]}
        projects={[slotted(2, 'Merge')]}
        sites={null}
      />,
    );

    expect(container.querySelector('[data-cut-out="overflow-0-more-banana"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cut-out="overflow-0-more-pods"]')).toBeInTheDocument();
    expect(screen.getByText('Eight')).toBeInTheDocument();
    expect(screen.getByText('Nine')).toBeInTheDocument();
  });
});
