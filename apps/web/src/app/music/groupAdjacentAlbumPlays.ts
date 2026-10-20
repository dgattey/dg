import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';

/**
 * A run of consecutive plays from the same album. A one-off play is a run of
 * one, so callers can treat every grid cell uniformly.
 */
export type AlbumPlayRun = {
  /** Stable React key, taken from the play that opened the run. */
  key: string;
  albumId: string;
  albumName: string;
  albumImageUrl: string;
  artistNames: string;
  /** Spotify album page, falling back to the opening track when unknown. */
  linkUrl: string;
  tracks: Array<HistoryTrack>;
};

/**
 * Identity used to decide whether two adjacent plays belong to the same album.
 * Album IDs are the real identity; the name/art pair only covers rows written
 * before we started storing an ID.
 */
function albumIdentity(track: HistoryTrack): string {
  return track.albumId || `${track.albumName}|${track.albumImageUrl}`;
}

function startRun(track: HistoryTrack): AlbumPlayRun {
  return {
    albumId: track.albumId,
    albumImageUrl: track.albumImageUrl,
    albumName: track.albumName,
    artistNames: track.artistNames,
    key: `${track.playedAt}-${track.trackId}`,
    linkUrl: track.albumUrl || track.url,
    tracks: [track],
  };
}

/**
 * Collapses temporally adjacent plays of one album into a single run.
 *
 * Listening to an album start to finish otherwise paints the same cover across
 * ten grid cells. Runs are purely positional: only plays that sit next to each
 * other in the list merge, so the same album listened to twice in a day stays
 * two runs.
 *
 * Callers pass the accumulated track list for one date section. Because
 * infinite scroll appends to that list before grouping runs, a run that
 * straddles a page boundary merges into one; because each date section groups
 * separately, a run never spans "Today" into "This week".
 */
export function groupAdjacentAlbumPlays(tracks: Array<HistoryTrack>): Array<AlbumPlayRun> {
  const runs: Array<AlbumPlayRun> = [];
  let currentIdentity: string | null = null;

  for (const track of tracks) {
    const identity = albumIdentity(track);
    const currentRun = runs.at(-1);

    if (currentRun && identity === currentIdentity) {
      currentRun.tracks.push(track);
      continue;
    }

    currentIdentity = identity;
    runs.push(startRun(track));
  }

  return runs;
}
