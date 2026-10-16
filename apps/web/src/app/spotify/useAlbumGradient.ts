'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { useEffect, useState } from 'react';
import { type AlbumGradientInformation, extractAlbumGradientFromUrl } from './extractAlbumGradient';

/**
 * Returns `track` with its album-art gradient and contrast setting, starting
 * from whatever the server sent and replacing them once the browser has
 * extracted the art's colors. Keeps sharp (and its native libvips) out of the
 * server module graph.
 */
export function useAlbumGradient(track: Track): Track {
  const [gradientInformation, setGradientInformation] = useState<AlbumGradientInformation>({
    backgroundGradient: track.albumGradient ?? null,
    contrastSetting: track.albumGradientContrastSetting ?? null,
  });

  useEffect(() => {
    let cancelled = false;
    extractAlbumGradientFromUrl(track.albumImage.url).then((info) => {
      if (!cancelled) {
        setGradientInformation(info);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [track.albumImage.url]);

  return {
    ...track,
    albumGradient: gradientInformation.backgroundGradient ?? undefined,
    albumGradientContrastSetting: gradientInformation.contrastSetting ?? undefined,
  };
}
