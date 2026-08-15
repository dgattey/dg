import { render, screen } from '@testing-library/react';
import { ForestLandmark, PIXELATE_ATTRIBUTE } from '../ForestLandmark';
import { PIXELATE_CONTRAST, PIXELATE_SATURATE, pixelatedMediaSx } from '../forestMaterials';

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
    expect(screen.queryByText('Rocky shore')).not.toBeInTheDocument();
    expect(screen.queryByText('Lakeside')).not.toBeInTheDocument();
    expect(screen.getByText('letter body')).toBeInTheDocument();
  });

  it('marks photographs for a light filter, not a mosaic', () => {
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
    expect(PIXELATE_CONTRAST).toBeLessThanOrEqual(1);
    expect(PIXELATE_SATURATE).toBeLessThanOrEqual(1);
    expect(pixelatedMediaSx).toEqual(
      expect.objectContaining({
        '& img': expect.objectContaining({
          imageRendering: 'auto',
        }),
      }),
    );
    expect(JSON.stringify(pixelatedMediaSx)).toContain('sepia');
    expect(JSON.stringify(pixelatedMediaSx)).not.toContain('pixelated');
    expect(JSON.stringify(pixelatedMediaSx)).not.toContain('forest-pixelate');
  });
});
