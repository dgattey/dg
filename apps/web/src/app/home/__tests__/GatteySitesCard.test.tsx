import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { render, screen } from '@testing-library/react';
import { GatteySitesCard } from '../GatteySitesCard';

jest.mock('../../collage/PaperCard', () => ({
  PaperCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('../../collage/PaperTag', () => ({
  PaperTag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const mark = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

const projects: Array<RenderableSideProject> = [
  {
    creationDate: '2026-10-15T00:00:00.000Z',
    description: 'Track books and reading progress',
    mark: {
      ...mark,
      title: 'Saga',
      url: 'https://images.ctfassets.net/example/saga.webp',
    },
    title: 'Saga',
    url: 'https://saga.gattey.com',
  },
  {
    creationDate: '2026-10-14T00:00:00.000Z',
    description: 'Spatial audio for Sonos and Spotify',
    mark: {
      ...mark,
      title: 'Sconeos',
      url: 'https://images.ctfassets.net/example/sconeos.webp',
    },
    title: 'Sconeos',
    url: 'https://sconeos.gattey.com',
  },
  {
    creationDate: '2026-07-01T00:00:00.000Z',
    description: 'See what you own and where it sits',
    mark,
    title: 'WMM',
    url: 'https://wmm.gattey.com',
  },
  {
    creationDate: '2026-06-01T00:00:00.000Z',
    description: 'Score Lost Cities by photo or manual entry',
    mark: {
      ...mark,
      title: 'Lost Cities',
      url: 'https://images.ctfassets.net/example/lost.webp',
    },
    title: 'Lost Cities scorer',
    url: 'https://lostcities.app',
  },
];

describe('GatteySitesCard', () => {
  it('links each side project independently', () => {
    render(<GatteySitesCard projects={projects} />);

    expect(screen.getByRole('heading', { name: 'Side projects' })).toBeInTheDocument();

    const sagaLink = screen.getByRole('link', { name: /Saga/ });
    expect(sagaLink).toHaveAttribute('href', 'https://saga.gattey.com');
    expect(sagaLink).toHaveAttribute('target', '_blank');

    const sconeosLink = screen.getByRole('link', { name: /Sconeos/ });
    expect(sconeosLink).toHaveAttribute('href', 'https://sconeos.gattey.com');
    expect(sconeosLink).toHaveAttribute('target', '_blank');

    const wmmLink = screen.getByRole('link', { name: /WMM/ });
    expect(wmmLink).toHaveAttribute('href', 'https://wmm.gattey.com');
    expect(wmmLink).toHaveAttribute('target', '_blank');

    const lostLink = screen.getByRole('link', { name: /Lost Cities scorer/ });
    expect(lostLink).toHaveAttribute('href', 'https://lostcities.app');
    expect(lostLink).toHaveAttribute('target', '_blank');

    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('marks each project icon and keeps marks decorative', () => {
    const { container } = render(<GatteySitesCard projects={projects} />);

    expect(container.querySelectorAll('[data-role="side-project-mark"]')).toHaveLength(4);
    expect(container.querySelectorAll('img[alt=""]')).toHaveLength(4);
  });

  it('offers each one-line description in full as a truncation tooltip', () => {
    render(<GatteySitesCard projects={projects} />);

    expect(
      screen.getAllByRole('tooltip', { hidden: true }).map((tooltip) => tooltip.textContent),
    ).toEqual(projects.map((project) => project.description));
  });

  it('renders nothing when there are no projects', () => {
    const { container } = render(<GatteySitesCard projects={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
