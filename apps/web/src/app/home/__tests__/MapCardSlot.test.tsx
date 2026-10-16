import { render, screen } from '@testing-library/react';
import { MapCardSlot } from '../MapCardSlot';

jest.mock('../../../services/contentful', () => ({
  getCurrentLocation: async () => ({
    point: { latitude: 37.72, longitude: -122.45 },
    title: 'My home',
    zoomLevels: [12, 16],
  }),
}));

jest.mock('@dg/maps/MapCard', () => ({
  MapCard: () => <div data-testid="map-card" />,
}));

describe('MapCardSlot', () => {
  it('tags the collage map as Home is SF without coordinates or the location title', async () => {
    render(await MapCardSlot({ surface: 'collage' }));

    const tag = screen.getByText('Home is').parentElement;
    expect(tag).toHaveTextContent('Home isSF');
    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.queryByText(/°/)).toBeNull();
    expect(screen.queryByText('My home')).toBeNull();
    expect(screen.getByTestId('map-card')).toBeInTheDocument();
  });

  it('renders the classic map with no Home is tag', async () => {
    render(await MapCardSlot({ surface: 'classic' }));

    expect(screen.getByTestId('map-card')).toBeInTheDocument();
    expect(screen.queryByText('Home is')).toBeNull();
    expect(screen.queryByText('SF')).toBeNull();
  });
});
