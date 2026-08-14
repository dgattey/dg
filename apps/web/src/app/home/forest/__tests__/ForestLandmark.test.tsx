import { render, screen } from '@testing-library/react';
import { ForestLandmark, PIXELATE_ATTRIBUTE } from '../ForestLandmark';
import { pixelatedMediaSx } from '../forestMaterials';

describe('ForestLandmark', () => {
  it('names the stop with the card label only', () => {
    const landmarkId = 'intro-image';
    render(
      <ForestLandmark id={landmarkId} label="About" tileX={10} tileY={19}>
        <p>letter body</p>
      </ForestLandmark>,
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.queryByText('Meadow camp')).not.toBeInTheDocument();
    expect(screen.queryByText('Wetland boardwalk')).not.toBeInTheDocument();
    expect(screen.queryByText('Forest grove')).not.toBeInTheDocument();
    expect(screen.queryByText('Mountain overlook')).not.toBeInTheDocument();
    expect(screen.getByText('letter body')).toBeInTheDocument();
  });

  it('marks photographs for a render-time pixelated treatment', () => {
    const landmarkId = 'project-a';
    const { container } = render(
      <ForestLandmark id={landmarkId} label="Alpha" tileX={4} tileY={8}>
        {/* biome-ignore lint/performance/noImgElement: the treatment targets a plain img, not next/image */}
        <img alt="Alpha" src="https://example.com/alpha.webp" />
      </ForestLandmark>,
    );

    const surface = container.querySelector(`[${PIXELATE_ATTRIBUTE}]`);
    expect(surface).not.toBeNull();
    expect(surface?.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/alpha.webp',
    );
    expect(pixelatedMediaSx).toEqual(
      expect.objectContaining({
        '& img': expect.objectContaining({
          imageRendering: 'pixelated',
        }),
      }),
    );
    expect(JSON.stringify(pixelatedMediaSx)).toContain(`url(#forest-pixelate)`);
  });
});
