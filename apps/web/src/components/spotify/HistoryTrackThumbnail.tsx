import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Tooltip } from '@mui/material';
import { ArtworkLink } from './ArtworkLink';

type HistoryTrack = Track & { playedAt: string };

type Props = {
  track: HistoryTrack;
};

const THUMBNAIL_SIZE = 80;

const cardSx: SxObject = {
  aspectRatio: '1 / 1',
  borderRadius: 2,
  overflow: 'hidden',
  position: 'relative',
};

export function HistoryTrackThumbnail({ track }: Props) {
  const { name: trackName, externalUrls, albumImage, artists } = track;
  const artistNames = artists.map((artist) => artist.name).join(', ');
  const tooltip = `${trackName} - ${artistNames}`;

  return (
    <Tooltip arrow title={tooltip}>
      <ArtworkLink
        cardSx={cardSx}
        hoverScale={1.08}
        href={externalUrls.spotify}
        image={albumImage}
        imageSize={THUMBNAIL_SIZE}
        sizes={{ extraLarge: THUMBNAIL_SIZE }}
        title={trackName}
      />
    </Tooltip>
  );
}
