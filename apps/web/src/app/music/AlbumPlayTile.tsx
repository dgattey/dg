import { Link } from '@dg/ui/dependent/Link';
import { collageCardTreatment } from '../collage/collageCardTreatment';
import { PaperTag } from '../collage/PaperTag';
import { AlbumCover } from './AlbumCover';
import { AlbumStack } from './AlbumStack';
import { CollageAlbumPaper } from './albums/collageAlbumCardTreatments';
import { MAX_ALBUM_SLEEVES } from './albumTileGeometry';
import { NewArtistBadge } from './NewArtistBadge';

type Props = {
  imageUrl: string;
  albumName: string;
  artistNames: string;
  /** The album for a run of plays, the track itself for a single play. */
  linkUrl: string;
  /** `New artist this …` when one of the artists was first played recently. */
  newArtist?: string | null;
  /** Plays collapsed into this cell. */
  trackCount: number;
  /** Names a single play, which a lone cover is labelled with. */
  trackName: string;
  cardIndex?: number;
  /** Loads the front cover eagerly at high priority. */
  isLcpCandidate?: boolean;
};

/**
 * One cell of listening history. A run of plays from one album fans sleeves
 * behind its cover and counts itself; a single play stays a lone cover, which
 * is what tells a whole album listen apart from one song.
 */
export function AlbumPlayTile({
  albumName,
  artistNames,
  cardIndex = 0,
  imageUrl,
  isLcpCandidate = false,
  linkUrl,
  newArtist = null,
  trackCount,
  trackName,
}: Props) {
  const sleeveCount = Math.min(trackCount - 1, MAX_ALBUM_SLEEVES);
  const countLabel = `${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}`;
  const isRun = trackCount > 1;
  const title = isRun ? albumName : trackName;

  const cover = (
    <AlbumCover
      alt={albumName}
      depth={0}
      imageUrl={imageUrl}
      isLcpCandidate={isLcpCandidate}
      sleeveCount={sleeveCount}
    />
  );

  return (
    <CollageAlbumPaper treatment={collageCardTreatment(cardIndex)}>
      <Link className="music__albumLink" href={linkUrl} isExternal={true}>
        <span className="music__art">
          <AlbumStack imageUrl={imageUrl} isLcpCandidate={isLcpCandidate} sleeveCount={sleeveCount}>
            {cover}
          </AlbumStack>
          {isRun ? (
            <PaperTag
              className="music__countTag"
              tiltDeg={cardIndex % 2 === 0 ? 3 : -3}
              tone="ochre"
              variant="meta"
            >
              {countLabel}
            </PaperTag>
          ) : null}
        </span>
        <span className="music__caption" data-typography="meta">
          <strong className="music__albumName" data-typography="title-sm">
            {title}
          </strong>
          <span className="music__artist">
            {artistNames}
            {newArtist ? (
              <NewArtistBadge label={newArtist} subject={isRun ? 'album' : 'song'} />
            ) : null}
          </span>
        </span>
      </Link>
    </CollageAlbumPaper>
  );
}
