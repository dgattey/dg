import type { Track } from '@dg/content-models/spotify/Track';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import { buildNoteLoopKeyframes, NOTES_CONFIG } from '../MusicNotes';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';
import { TrackListing } from '../TrackListing';
import {
  buildPreRedesignBounceKeyframes,
  WAVEFORM_BOUNCE_BEAT_FREQ,
  WAVEFORM_BOUNCE_DURATION_MS,
  WAVEFORM_BOUNCE_TOTAL_FRAMES,
} from '../useWaveformBounce';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../../../services/spotify.actions', () => ({
  loadLatestSong: jest.fn(async () => null),
}));

const TRACK: Track = {
  album: {
    id: 'album',
    name: 'Album',
    releaseDate: '2026-01-01',
    url: 'https://open.spotify.com/album',
  },
  albumImage: { height: 640, url: 'https://images.test/album.jpg', width: 640 },
  artists: [{ id: 'marina', name: 'MARINA', url: 'https://open.spotify.com/artist/marina' }],
  id: 'track',
  isPlaying: true,
  name: 'Perfect Light',
  url: 'https://open.spotify.com/track',
};

const MESH = 'linear-gradient(165deg, #2d3246 0%, #5c2824 100%)';

describe('SpotifyHeaderCard and TrackListing', () => {
  it.each([
    ['/music', '/reading'],
    ['/reading', '/music'],
    ['/', '/reading'],
    ['/reading', '/'],
  ])(
    'keeps the same bouncing art DOM node and compact header notes mounted when navigating from %s to %s',
    (from, to) => {
      mockPathname = from;
      const { container, rerender } = render(
        <ServerTimeProvider serverTime={1_760_000_000_000}>
          <SpotifyHeaderCard track={TRACK} />
        </ServerTimeProvider>,
      );
      const bounceBefore = container.querySelector('[data-art-notes-bounce]');
      expect(bounceBefore).not.toBeNull();
      expect(container.querySelector('[data-ambient-notes="collageCompact"]')).not.toBeNull();
      expect(container.querySelectorAll('[data-music-note]')).toHaveLength(
        NOTES_CONFIG.collageCompact.slotIds.length,
      );

      mockPathname = to;
      rerender(
        <ServerTimeProvider serverTime={1_760_000_000_000}>
          <SpotifyHeaderCard track={TRACK} />
        </ServerTimeProvider>,
      );

      const bounceAfter = container.querySelector('[data-art-notes-bounce]');
      expect(bounceAfter).toBe(bounceBefore);
      expect(container.querySelector('[data-ambient-notes="collageCompact"]')).not.toBeNull();
    },
  );

  it('emanates music notes and forwards data-track-title on the full card when playing', () => {
    const { container } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <TrackListing
          albumColors={{ ink: 'light', mesh: MESH, surface: MESH }}
          track={TRACK}
          variant="card"
        />
      </ServerTimeProvider>,
    );

    expect(container.querySelector('[data-ambient-notes="collage"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-music-note]')).toHaveLength(
      NOTES_CONFIG.collage.slotIds.length,
    );
    expect(container.querySelector('[data-art-notes-bounce]')).toHaveAttribute(
      'data-playing',
      'true',
    );
    expect(container.querySelector('[data-playback-status-icon]')).toHaveAttribute(
      'data-playing',
      'true',
    );
    const titleLink = screen.getByRole('link', { name: 'Perfect Light' });
    expect(titleLink).toHaveAttribute('data-track-title', '');
    expect(titleLink).toHaveAttribute('data-has-color', '');
  });

  it('synthesizes the pre-redesign e5174284 bounce (Tweak C at 0.95 / ~91 BPM) and note trajectories with seamless loop boundaries', () => {
    expect(WAVEFORM_BOUNCE_BEAT_FREQ).toBe(0.95);
    expect(WAVEFORM_BOUNCE_TOTAL_FRAMES).toBe(1308);
    expect(WAVEFORM_BOUNCE_DURATION_MS).toBeCloseTo(21800, 1);

    const fixedRand = () => 0.5;
    const bounceKfs = buildPreRedesignBounceKeyframes(1, fixedRand);
    const explicitTweakCKfs = buildPreRedesignBounceKeyframes(1, fixedRand, 'upbeat-tempo');
    expect(bounceKfs).toEqual(explicitTweakCKfs);
    expect(bounceKfs).toHaveLength(WAVEFORM_BOUNCE_TOTAL_FRAMES / 2 + 1);
    expect(bounceKfs[0]?.offset).toBe(0);
    expect(bounceKfs.at(-1)?.offset).toBe(1);
    expect(bounceKfs[0]?.transform).toBe(bounceKfs.at(-1)?.transform);

    const noteKfs = buildNoteLoopKeyframes(0, 'collage');
    expect(noteKfs[0]).toMatchObject({ offset: 0, opacity: 0.01 });
    expect(noteKfs.at(-1)).toMatchObject({ offset: 1, opacity: 0.01 });

    const { container } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <TrackListing
          albumColors={{ ink: 'light', mesh: MESH, surface: MESH }}
          track={{ ...TRACK, isPlaying: false, playedAt: '2026-02-10T09:00:00Z' }}
          variant="card"
        />
      </ServerTimeProvider>,
    );
    expect(container.querySelector('[data-art-notes-bounce]')).not.toHaveAttribute('data-playing');
    expect(container.querySelector('[data-ambient-notes]')).toBeNull();
  });
});
