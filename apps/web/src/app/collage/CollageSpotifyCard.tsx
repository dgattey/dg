'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ArtistList } from '../spotify/ArtistList';
import type { Colors } from '../spotify/colors';
import { PlaybackProgressBar } from '../spotify/PlaybackProgressBar';
import { PlaybackStatus } from '../spotify/PlaybackStatus';
import { TrackTitle } from '../spotify/TrackTitle';
import styles from './CollageSpotifyCard.module.css';
import { PaperCard } from './PaperCard';
import { RecordDisc } from './RecordDisc';
import sheetStyles from './WorkSheet.module.css';

export const COLLAGE_TRACK_COLORS: Colors = {
  primary: 'var(--on)',
  primaryContrast: 'var(--pc)',
  primaryShadow: 'none',
  secondary: 'var(--soft)',
  secondaryShadow: 'none',
};

export function CollageSpotifyCard({ track }: { track: Track }) {
  const trackUrl = track.externalUrls.spotify;

  return (
    <div className={sheetStyles.spotify} data-slot="sp">
      <RecordDisc track={track} />
      <PaperCard className={styles.meta} edge="quad-b" tiltDeg={-2} tone="cream">
        <div className={styles.metaInner}>
          <PlaybackStatus
            color={COLLAGE_TRACK_COLORS.primary}
            isPlaying={track.isPlaying}
            listingVariant="card"
            playedAt={track.playedAt}
          />
          <TrackTitle
            color={COLLAGE_TRACK_COLORS.primary}
            listingVariant="card"
            trackTitle={track.name}
            url={trackUrl}
          />
          <ArtistList
            artists={track.artists}
            color={COLLAGE_TRACK_COLORS.secondary}
            listingVariant="card"
          />
          <PlaybackProgressBar
            colors={COLLAGE_TRACK_COLORS}
            durationMs={track.durationMs}
            isPlaying={track.isPlaying}
            progressMs={track.progressMs}
          />
        </div>
      </PaperCard>
    </div>
  );
}
