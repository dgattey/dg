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
  it('tags the map as Home SF without coordinates or the location title', async () => {
    render(await MapCardSlot());

    const tag = screen.getByText('Home').parentElement;
    expect(tag).toHaveTextContent('HomeSF');
    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.queryByText(/°/)).toBeNull();
    expect(screen.queryByText('My home')).toBeNull();
    expect(screen.getByTestId('map-card')).toBeInTheDocument();
  });
});
