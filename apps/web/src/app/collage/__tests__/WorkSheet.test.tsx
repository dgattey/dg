/**
 * @jest-environment jsdom
 */

import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { render, screen } from '@testing-library/react';
import { WorkSheet } from '../WorkSheet';
import type { ProjectFrameStyle } from '../workSheetFrames';

jest.mock('../../home/ProjectCard', () => ({
  ProjectCard: ({
    title,
    surface,
    style,
    'data-work-slot': workSlot,
  }: {
    title: string;
    surface?: string;
    style?: ProjectFrameStyle;
    'data-work-slot'?: string;
  }) => (
    <div
      data-has-style={style ? 'true' : 'false'}
      data-surface={surface}
      data-testid="project-card"
      data-work-slot={workSlot}
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

const project = (title: string, overrides: Partial<RenderableProject> = {}): RenderableProject => ({
  link: { icon: null, title, url: `https://example.com/${title}` },
  thumbnail: { height: 400, url: `https://images.test/${title}.jpg`, width: 900 },
  title,
  ...overrides,
});

describe('WorkSheet', () => {
  it('renders ProjectCard collage frames in mobile DOM order with slot nodes', () => {
    render(
      <WorkSheet
        projects={[project('Cursor'), project('Watershed')]}
        spotify={<div data-testid="spotify-node" />}
        strava={<div data-testid="strava-node" />}
      />,
    );

    expect(screen.getByRole('region', { name: 'Work' })).toBeInTheDocument();
    const cards = screen.getAllByTestId('project-card');
    expect(cards.map((node) => node.textContent)).toEqual(['Cursor', 'Watershed']);
    expect(cards[0]).toHaveAttribute('data-surface', 'collage');
    expect(cards[0]).toHaveAttribute('data-work-slot', 'c1');
    expect(cards[0]).toHaveAttribute('data-has-style', 'true');
    expect(cards[1]).toHaveAttribute('data-surface', 'collage');
    expect(cards[1]).toHaveAttribute('data-work-slot', 'ws');
    expect(cards[1]).toHaveAttribute('data-has-style', 'true');

    const grid = screen.getByTestId('spotify-node').parentElement;
    expect(grid?.children[0]).toHaveAttribute('data-work-slot', 'c1');
    expect(grid?.children[1]).toHaveAttribute('data-testid', 'spotify-node');
    expect(grid?.children[2]).toHaveAttribute('data-testid', 'strava-node');
    expect(grid?.children[3]).toHaveAttribute('data-work-slot', 'ws');
    expect(screen.getByTestId('torn-field')).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits project frames when there are no projects', () => {
    render(
      <WorkSheet
        projects={[]}
        spotify={<div data-testid="spotify-node" />}
        strava={<div data-testid="strava-node" />}
      />,
    );

    expect(screen.queryByTestId('project-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('spotify-node')).toBeInTheDocument();
    expect(screen.getByTestId('strava-node')).toBeInTheDocument();
  });

  it('renders a single collage ProjectCard for one project', () => {
    render(<WorkSheet projects={[project('Only')]} spotify={null} strava={null} />);

    expect(screen.getAllByTestId('project-card')).toHaveLength(1);
    expect(screen.getByTestId('project-card')).toHaveTextContent('Only');
    expect(screen.getByTestId('project-card')).toHaveAttribute('data-surface', 'collage');
    expect(screen.getByTestId('project-card')).toHaveAttribute('data-work-slot', 'c1');
  });
});
