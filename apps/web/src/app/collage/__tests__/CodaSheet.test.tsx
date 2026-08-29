/**
 * @jest-environment jsdom
 */

import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { render, screen } from '@testing-library/react';
import type { SlottedProject } from '../assignProjectSlots';
import { CodaSheet } from '../CodaSheet';
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

const slotted = (sourceIndex: number, title: string): SlottedProject => ({
  key: `p-${sourceIndex}`,
  project: {
    layout: 'tall',
    link: { icon: null, title, url: `https://example.com/${title}` },
    thumbnail: { height: 560, url: `https://images.test/${title}.jpg`, width: 448 },
    title,
  } satisfies RenderableProject,
});

describe('CodaSheet', () => {
  it('returns null when the coda project is missing', () => {
    const { container } = render(<CodaSheet project={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders project 7 in its own And region', () => {
    render(<CodaSheet project={slotted(6, 'LinkedIn')} />);

    expect(screen.getByRole('region', { name: 'And' })).toBeInTheDocument();
    expect(screen.getByTestId('project-card')).toHaveTextContent('LinkedIn');
    expect(screen.getByTestId('project-card')).toHaveAttribute('data-slot', 'li');
    expect(screen.getByTestId('project-card')).toHaveAttribute('data-surface', 'collage');
    expect(screen.getByTestId('project-card')).toHaveAttribute('data-has-style', 'true');
  });
});
