import type { RenderableSideProject } from '@dg/content-models/contentful/renderables/sideProjects';
import { render, screen } from '@testing-library/react';
import { GatteySitesCard } from '../GatteySitesCard';

const mark = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

const projects: Array<RenderableSideProject> = [
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

    const wmmLink = screen.getByRole('link', { name: 'WMM' });
    expect(wmmLink).toHaveAttribute('href', 'https://wmm.gattey.com');
    expect(wmmLink).toHaveAttribute('target', '_blank');

    const lostLink = screen.getByRole('link', { name: 'Lost Cities scorer' });
    expect(lostLink).toHaveAttribute('href', 'https://lostcities.app');
    expect(lostLink).toHaveAttribute('target', '_blank');

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('renders nothing when there are no projects', () => {
    const { container } = render(<GatteySitesCard projects={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
