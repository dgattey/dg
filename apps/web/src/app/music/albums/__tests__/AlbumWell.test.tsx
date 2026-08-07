import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { act, render, screen } from '@testing-library/react';
import { AlbumWell } from '../AlbumWell';
import { ALBUM_WELL_TRACK_NUMBER_COLUMN } from '../albumWellStyles';

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

    expect(shell).toHaveStyle({ height: '80px', overflow: 'hidden' });

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
    expect(getComputedStyle(shell).overflow).not.toBe('hidden');

    rafSpy.mockRestore();
    global.ResizeObserver = OriginalResizeObserver;
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
