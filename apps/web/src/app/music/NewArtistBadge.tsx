import { Tooltip } from '@dg/ui/core/Tooltip';

/** A small paper tag beside an artist first played in the period on screen. */
export function NewArtistBadge({ label }: { label: string }) {
  return (
    <Tooltip className="music__newArtistAnchor" placement="top" title={label}>
      <span aria-label={label} className="music__newArtist" role="img">
        New!
      </span>
    </Tooltip>
  );
}
