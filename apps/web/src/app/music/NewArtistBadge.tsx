import { Tooltip } from '@dg/ui/core/Tooltip';

/** What a row is about. Only a dedicated artist or album row tags an artist as new. */
export type ArtistRowSubject = 'album' | 'artist' | 'genre' | 'song';

/** A small paper tag beside an artist first played in the period on screen. */
export function NewArtistBadge({ label, subject }: { label: string; subject: ArtistRowSubject }) {
  if (subject !== 'album' && subject !== 'artist') {
    return null;
  }
  return (
    <Tooltip className="music__newArtistAnchor" placement="top" title={label}>
      <span aria-label={label} className="music__newArtist" data-typography="stamp" role="img">
        New!
      </span>
    </Tooltip>
  );
}
