import { render, screen } from '@testing-library/react';
import { Homepage } from '../Homepage';

jest.mock('../../../services/contentful', () => ({
  getProjects: jest.fn(async () => [
    {
      description: { json: { content: [], data: {}, nodeType: 'document' } },
      link: { icon: null, title: 'Flowstate', url: 'https://example.com/flowstate' },
      thumbnail: { height: 200, url: 'https://example.com/flowstate.png', width: 200 },
      title: 'Flowstate',
      type: ['TypeScript'],
    },
    {
      description: { json: { content: [], data: {}, nodeType: 'document' } },
      link: { icon: null, title: 'Other', url: 'https://example.com/other' },
      thumbnail: { height: 200, url: 'https://example.com/other.png', width: 200 },
      title: 'Other',
      type: ['Go'],
    },
  ]),
}));

jest.mock('../IntroCardSlot', () => ({
  IntroCardSlot: () => <div data-bento="intro">intro</div>,
}));

jest.mock('../SpotifyCard', () => ({
  SpotifyCardSlot: () => <div data-bento="now-playing">now playing</div>,
}));

jest.mock('../StravaCardSlot', () => ({
  StravaCardSlot: () => <div data-bento="activity">activity</div>,
}));

jest.mock('../ProjectCard', () => ({
  ProjectCard: ({ title, variant }: { title: string; variant?: string }) => (
    <div data-bento={variant === 'featured' ? 'featured' : 'media'}>{title}</div>
  ),
}));

jest.mock('../MapCardSlot', () => ({
  MapCardSlot: () => <div data-bento="map">map</div>,
}));

jest.mock('../GatteySitesCardSlot', () => ({
  GatteySitesCardSlot: () => <div data-bento="gattey-sites">gattey sites</div>,
}));

describe('Homepage greenhouse', () => {
  it('emits every flag-off slot including leftover projects', async () => {
    const page = await Homepage({
      Grid: ({ children }) => <div data-testid="grid">{children}</div>,
      introVariant: 'composed',
    });
    render(page);

    const grid = screen.getByTestId('grid');
    expect(grid.children).toHaveLength(7);
    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(screen.getByText('now playing')).toBeInTheDocument();
    expect(screen.getByText('activity')).toBeInTheDocument();
    expect(screen.getByText('Flowstate')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('map')).toBeInTheDocument();
    expect(screen.getByText('gattey sites')).toBeInTheDocument();
  });
});
