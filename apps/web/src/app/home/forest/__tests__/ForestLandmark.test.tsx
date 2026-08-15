import { render, screen } from '@testing-library/react';
import { ForestLandmark } from '../ForestLandmark';

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

  it('does not tilt the plaque off the ground plane', () => {
    const landmarkId = 'about-flat';
    const { container } = render(
      <ForestLandmark id={landmarkId} label="About" tileX={10} tileY={19}>
        <p>letter body</p>
      </ForestLandmark>,
    );
    expect(container.innerHTML).not.toContain('rotateX');
    expect(container.innerHTML).not.toContain('perspective');
    expect(container.querySelector('[data-role="forest-stack"]')).not.toBeNull();
    expect(container.querySelector('[data-role="forest-posts"]')).not.toBeNull();
    expect(container.querySelector('[data-role="forest-dirt"]')).not.toBeNull();
    expect(container.querySelector('[data-role="forest-shadow"]')).not.toBeNull();
  });

  it('leaves photographs as prints, not a mosaic', () => {
    const landmarkId = 'project-a';
    const { container } = render(
      <ForestLandmark id={landmarkId} label="Alpha" tileX={4} tileY={8}>
        {/* biome-ignore lint/performance/noImgElement: the treatment targets a plain img, not next/image */}
        <img alt="Alpha" src="https://example.com/alpha.webp" />
      </ForestLandmark>,
    );

    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('https://example.com/alpha.webp');
    expect(container.innerHTML).not.toContain('pixelated');
    expect(container.innerHTML).not.toContain('sepia');
  });
});
