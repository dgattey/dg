/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Homepage } from '../Homepage';

const mockGetProjects = jest.fn();

jest.mock('../../../services/contentful', () => ({
  getProjects: () => mockGetProjects(),
}));

jest.mock('@dg/ui/core/ContentGrid', () => ({
  ContentGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="classic-grid">{children}</div>
  ),
}));

jest.mock('../IntroCardSlot', () => ({
  IntroCardSlot: ({ surface }: { surface: string }) => (
    <div data-testid="intro-slot">{surface}</div>
  ),
}));

jest.mock('../MapCardSlot', () => ({
  MapCardSlot: ({ surface }: { surface: string }) => <div data-testid="map-slot">{surface}</div>,
}));

jest.mock('../ProjectCard', () => ({
  ProjectCard: ({ title }: { title: string }) => <div data-testid="project-card">{title}</div>,
}));

jest.mock('../SpotifyCard', () => ({
  SpotifyCardSlot: () => <div data-testid="spotify-slot" />,
}));

jest.mock('../StravaCardSlot', () => ({
  StravaCardSlot: () => <div data-testid="strava-slot" />,
}));

jest.mock('../GatteySitesCardSlot', () => ({
  GatteySitesCardSlot: () => <div data-testid="sites-slot" />,
}));

describe('Homepage surfaces', () => {
  beforeEach(() => {
    mockGetProjects.mockReset();
    mockGetProjects.mockResolvedValue([{ title: 'Real project' }]);
  });

  it('fetches projects once and renders only the Hello sheet for collage', async () => {
    render(await Homepage({ surface: 'collage' }));

    expect(mockGetProjects).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('region', { name: 'Hello' })).toBeInTheDocument();
    expect(screen.getByTestId('intro-slot')).toHaveTextContent('collage');
    expect(screen.getByTestId('map-slot')).toHaveTextContent('collage');
    expect(screen.queryByTestId('classic-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('project-card')).not.toBeInTheDocument();
  });

  it('keeps the interleaved grid as the default surface', async () => {
    render(await Homepage());

    expect(mockGetProjects).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('classic-grid')).toBeInTheDocument();
    expect(screen.getByTestId('intro-slot')).toHaveTextContent('classic');
    expect(screen.getByTestId('map-slot')).toHaveTextContent('classic');
    expect(screen.getByTestId('project-card')).toHaveTextContent('Real project');
    expect(screen.queryByRole('region', { name: 'Hello' })).not.toBeInTheDocument();
  });
});
