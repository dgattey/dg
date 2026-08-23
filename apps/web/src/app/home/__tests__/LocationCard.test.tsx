import { render, screen } from '@testing-library/react';
import { LocationCard } from '../LocationCard';

jest.mock('@dg/maps/MapCard', () => ({
  MapCard: ({ location }: { location: { image?: { title?: string } } | null | undefined }) => (
    <div data-testid="map-card">{location?.image?.title ?? 'empty'}</div>
  ),
}));

describe('LocationCard', () => {
  it('puts a Location eyebrow over the map well', () => {
    render(
      <LocationCard
        location={{
          image: { height: 80, title: 'Memoji', url: 'https://example.com/pin.png', width: 80 },
          initialZoom: 12,
          point: { latitude: 37.77, longitude: -122.42 },
          zoomLevels: [11, 12, 13],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Location' })).toHaveClass('MuiTypography-overline');
    expect(screen.getByTestId('map-card')).toHaveTextContent('Memoji');
    expect(document.querySelector('[data-location-map]')).toBeTruthy();
  });
});
