import type { Track } from '@dg/content-models/spotify/Track';
import { getContrastingColors } from '../colors';

const base = {
  album: {
    externalUrls: { spotify: 'https://open.spotify.com/album/a' },
    href: 'https://api.spotify.com/album/a',
    id: 'a',
    images: [{ height: 64, url: '/art.jpg', width: 64 }],
    name: 'Glasshouse',
    releaseDate: '2026-01-01',
    uri: 'spotify:album:a',
  },
  albumImage: { height: 64, url: '/art.jpg', width: 64 },
  artists: [
    {
      externalUrls: { spotify: 'https://open.spotify.com/artist/a' },
      href: 'https://api.spotify.com/artist/a',
      id: 'a',
      name: 'Alder & Moss',
      uri: 'spotify:artist:a',
    },
  ],
  externalUrls: { spotify: 'https://open.spotify.com/track/t' },
  href: 'https://api.spotify.com/track/t',
  id: 't',
  name: 'Leaflight',
  uri: 'spotify:track:t',
} satisfies Track;

describe('getContrastingColors', () => {
  it('returns null so greenhouse type can inherit when there is no wash', () => {
    expect(getContrastingColors(base)).toBeNull();
  });

  it('uses the stored contrast hint when present', () => {
    const colors = getContrastingColors({
      ...base,
      albumGradient: 'linear-gradient(#111, #222)',
      albumGradientContrastSetting: 'light',
    });
    expect(colors?.primary).toBe('rgba(0, 0, 0, 0.7)');
  });

  it('derives dark-background type from a dark CSS wash', () => {
    const colors = getContrastingColors({
      ...base,
      albumGradient: 'linear-gradient(hsla(24, 40%, 16%, 0.9), rgb(20, 18, 16))',
    });
    expect(colors?.primary).toBe('rgba(255, 255, 255, 0.7)');
  });

  it('derives light-background type from a light CSS wash', () => {
    const colors = getContrastingColors({
      ...base,
      albumGradient: 'linear-gradient(hsla(40, 40%, 92%, 0.9), #f4efe4)',
    });
    expect(colors?.primary).toBe('rgba(0, 0, 0, 0.7)');
  });
});
