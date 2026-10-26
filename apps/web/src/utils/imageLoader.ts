import type { ImageLoaderProps } from 'next/image';

const DEFAULT_CONTENTFUL_QUALITY = 75;
const SPOTIFY_SMALL_MAX_WIDTH = 64;
const SPOTIFY_MEDIUM_MAX_WIDTH = 300;
const SPOTIFY_ALBUM_PATH = /^\/image\/ab67616d0000(?:b273|1e02|4851)([0-9a-f]{24,32})$/i;
const SPOTIFY_MOSAIC_PATH = /^\/(?:640|300|60)\/([0-9a-f]+)$/i;
const SVG_PATH = /\.svg$/i;

function spotifyAlbumSizeCode(width: number): '4851' | '1e02' | 'b273' {
  if (width <= SPOTIFY_SMALL_MAX_WIDTH) {
    return '4851';
  }
  if (width <= SPOTIFY_MEDIUM_MAX_WIDTH) {
    return '1e02';
  }
  return 'b273';
}

function spotifyMosaicSize(width: number): '60' | '300' | '640' {
  if (width <= SPOTIFY_SMALL_MAX_WIDTH) {
    return '60';
  }
  if (width <= SPOTIFY_MEDIUM_MAX_WIDTH) {
    return '300';
  }
  return '640';
}

/**
 * Routes Contentful raster images through Contentful's CDN (`fm=avif`) and maps
 * Spotify album/mosaic covers to their closest pre-sized CDN tier (`64px`,
 * `300px`, or `640px`), bypassing `/_next/image`.
 */
export default function imageLoader({ quality, src, width }: ImageLoaderProps): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  if (src.startsWith('/') && !src.startsWith('//')) {
    const [pathname = '', query = ''] = src.split('?', 2);
    if (SVG_PATH.test(pathname)) {
      return src;
    }
    const params = new URLSearchParams(query);
    params.set('w', String(width));
    return `${pathname}?${params.toString()}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return src;
  }

  if (SVG_PATH.test(parsed.pathname)) {
    return src;
  }

  if (parsed.hostname === 'images.ctfassets.net') {
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality ?? DEFAULT_CONTENTFUL_QUALITY));
    parsed.searchParams.set('fm', 'avif');
    return parsed.toString();
  }

  if (parsed.hostname === 'i.scdn.co') {
    const match = SPOTIFY_ALBUM_PATH.exec(parsed.pathname);
    if (match?.[1]) {
      parsed.pathname = `/image/ab67616d0000${spotifyAlbumSizeCode(width)}${match[1]}`;
      return parsed.toString();
    }
    return src;
  }

  if (parsed.hostname === 'mosaic.scdn.co') {
    const match = SPOTIFY_MOSAIC_PATH.exec(parsed.pathname);
    if (match?.[1]) {
      parsed.pathname = `/${spotifyMosaicSize(width)}/${match[1]}`;
      return parsed.toString();
    }
    return src;
  }

  return src;
}
