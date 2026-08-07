import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { act, render, screen } from '@testing-library/react';
import { AlbumDetailBodySkeleton } from '../AlbumDetailBodySkeleton';
import { AlbumWell } from '../AlbumWell';
import { ALBUM_WELL_NAME_BAND, ALBUM_WELL_TRACK_NUMBER_COLUMN } from '../albumWellStyles';

/**
 * Conditional rules, pseudo-elements and the height reserve never resolve into
 * an element's own style, so they are read off the stylesheet Emotion emits for
 * it. Emotion inserts through the CSSOM here, which leaves the `style` tags
 * themselves empty.
 */
function rulesFor(element: Element | null) {
  const classes = [...(element?.classList ?? [])];
  const rules = [...document.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules].map((rule) => rule.cssText);
    } catch {
      return [];
    }
  });
  return rules
    .filter((rule) => classes.some((className) => rule.includes(`.${className}`)))
    .join('\n');
}

function wellRules() {
  return rulesFor(document.querySelector('section'));
}

const album: PlaylistAlbum = {
  addedAt: '2024-01-02T03:04:05Z',
  artistNames: 'Primary Artist, Guest',
  id: 'album-1',
  imageUrl: 'https://i.scdn.co/image/album-1',
  name: 'Example Album',
  primaryArtist: 'Primary Artist',
  releaseDate: '2019-04-12',
  url: 'https://open.spotify.com/album/album-1',
};

describe('AlbumWell', () => {
  it('renders art and title linking to the album on Spotify', () => {
    render(<AlbumWell album={album} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Example Album' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Example Album' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/album-1',
    );
    expect(screen.getByRole('link', { name: 'Open Example Album on Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/album-1',
    );
  });

  it('renders streamed detail inside the well', () => {
    render(
      <AlbumWell album={album}>
        <p>streamed tracklist</p>
      </AlbumWell>,
    );

    expect(screen.getByText('streamed tracklist')).toBeInTheDocument();
  });

  it('starts the album name on the same text edge the tracklist uses', () => {
    render(<AlbumWell album={album} />);

    const name = screen.getByRole('heading', { name: 'Example Album' });

    expect(getComputedStyle(name).gridTemplateColumns).toBe(
      `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
    );
    expect(getComputedStyle(screen.getByRole('link', { name: 'Example Album' })).gridColumn).toBe(
      '2',
    );
  });

  it('reserves a gutter that no streamed track count can change', () => {
    expect(ALBUM_WELL_TRACK_NUMBER_COLUMN).toBe('1.5rem');
  });

  it('holds the name band at exactly the height the meta band pins against', () => {
    render(<AlbumWell album={album} />);

    // Left to its own line box the band comes up short of this, and the strip
    // it leaves is where the tracklist showed between the two pinned surfaces.
    const band = rulesFor(screen.getByRole('heading', { name: 'Example Album' }));

    expect(band.replaceAll(/\s+/g, ' ')).toContain(`block-size: ${ALBUM_WELL_NAME_BAND}`);
  });

  it('backs the pinned name with opaque well surface running up past the fade', () => {
    render(<AlbumWell album={album} />);

    const band = rulesFor(screen.getByRole('heading', { name: 'Example Album' }));

    // Above the band, so the tracklist is gone before it reaches the band's edge
    // rather than ghosting through the sorter fade's near-transparent tail.
    expect(band).toMatch(/::before/);
    expect(band).toMatch(/bottom:\s*100%/);
    // Wider than the text column, to reach the card's edges and cover the art.
    expect(band).toMatch(/inset-inline:\s*-100%/);
    // And the card trims both overshoots, so none of it escapes onto the page.
    expect(wellRules()).toMatch(/overflow:\s*clip/);
  });

  it('tweens shell height when streamed content grows, then releases to auto', () => {
    let observerCallback: ResizeObserverCallback | undefined;
    const OriginalResizeObserver = global.ResizeObserver;

    global.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    } as unknown as typeof ResizeObserver;

    let rafCallback: FrameRequestCallback | undefined;
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        rafCallback = callback;
        return 1;
      });

    const { container } = render(
      <AlbumWell album={album}>
        <div>skeleton</div>
      </AlbumWell>,
    );

    const shell = container.firstElementChild as HTMLElement;
    const measure = shell.firstElementChild as HTMLElement;
    let scrollHeight = 80;

    Object.defineProperty(measure, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    // Seed the previous height the way the mount observer does.
    act(() => {
      observerCallback?.([] as unknown as Array<ResizeObserverEntry>, {} as ResizeObserver);
    });

    scrollHeight = 240;
    act(() => {
      observerCallback?.([] as unknown as Array<ResizeObserverEntry>, {} as ResizeObserver);
    });

    // `clip`, not `hidden`: a scrollport here would re-anchor the well's sticky
    // art and name band to the shell and slide them down their `top` offsets.
    expect(shell).toHaveStyle({ height: '80px', overflow: 'clip' });

    act(() => {
      rafCallback?.(0);
    });

    expect(shell).toHaveStyle({ height: '240px' });

    act(() => {
      const end = new Event('transitionend', { bubbles: true });
      Object.defineProperty(end, 'propertyName', { value: 'height' });
      Object.defineProperty(end, 'target', { value: shell });
      Object.defineProperty(end, 'currentTarget', { value: shell });
      shell.dispatchEvent(end);
    });

    expect(shell).not.toHaveStyle({ height: '240px' });
    expect(getComputedStyle(shell).overflow).toBe('visible');

    rafSpy.mockRestore();
    global.ResizeObserver = OriginalResizeObserver;
  });

  it('floors the well at the outgoing height while a placeholder stands in', () => {
    let observerCallback: ResizeObserverCallback | undefined;
    const OriginalResizeObserver = global.ResizeObserver;

    global.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    } as unknown as typeof ResizeObserver;

    const { container, rerender } = render(
      <AlbumWell album={album}>
        <div>album one tracklist</div>
      </AlbumWell>,
    );

    const shell = container.firstElementChild as HTMLElement;
    const measure = shell.firstElementChild as HTMLElement;
    const scrollHeight = 900;

    Object.defineProperty(measure, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    // Settle on album one's tall tracklist.
    act(() => {
      observerCallback?.([] as unknown as Array<ResizeObserverEntry>, {} as ResizeObserver);
    });

    expect(wellRules()).not.toMatch(/min-height/);

    // Switching albums swaps in a placeholder far shorter than what it replaces.
    act(() => {
      rerender(
        <AlbumWell album={{ ...album, id: 'album-2', name: 'Other Album' }}>
          <AlbumDetailBodySkeleton />
        </AlbumWell>,
      );
    });

    const floored = wellRules();

    // Scoped to the placeholder, so its removal is what drops the floor.
    expect(floored).toMatch(
      /:has\(\[data-role="album-detail-placeholder"\]\)\s*\{\s*min-height:\s*900px/,
    );
    expect(screen.getByRole('region', { name: 'Other Album details' })).toBeInTheDocument();

    // The floor's slack has to collect below the tracklist. Stretched rows would
    // spread it through the card and strand the placeholder past the fold.
    expect(floored).toMatch(/align-content:\s*start/);

    global.ResizeObserver = OriginalResizeObserver;
  });

  it('has no floor to apply before an album has ever been measured', () => {
    render(
      <AlbumWell album={album}>
        <AlbumDetailBodySkeleton />
      </AlbumWell>,
    );

    expect(wellRules()).not.toMatch(/min-height/);
  });

  it('skips height tweening when the user prefers reduced motion', () => {
    let observerCallback: ResizeObserverCallback | undefined;
    const OriginalResizeObserver = global.ResizeObserver;
    const matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          addEventListener: jest.fn(),
          addListener: jest.fn(),
          dispatchEvent: jest.fn(),
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          removeEventListener: jest.fn(),
          removeListener: jest.fn(),
        }) as MediaQueryList,
    );

    global.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    } as unknown as typeof ResizeObserver;

    const { container } = render(
      <AlbumWell album={album}>
        <div>skeleton</div>
      </AlbumWell>,
    );

    const shell = container.firstElementChild as HTMLElement;
    const measure = shell.firstElementChild as HTMLElement;
    let scrollHeight = 80;

    Object.defineProperty(measure, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    act(() => {
      observerCallback?.([] as unknown as Array<ResizeObserverEntry>, {} as ResizeObserver);
    });

    scrollHeight = 240;
    act(() => {
      observerCallback?.([] as unknown as Array<ResizeObserverEntry>, {} as ResizeObserver);
    });

    expect(shell).not.toHaveStyle({ height: '80px' });

    matchMediaSpy.mockRestore();
    global.ResizeObserver = OriginalResizeObserver;
  });
});
