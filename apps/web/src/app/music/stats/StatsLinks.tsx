import type { ListeningStats, StatsAlbumRef } from '@dg/services/spotify/fetchListeningStats';
import type { SpotifyLink } from '@dg/services/spotify/spotifyLinks';
import { albumRoute } from '@dg/shared-core/routes/app';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { Fragment, type ReactNode } from 'react';
import { cx } from '../../collage/paperVars';
import { NewArtistBadge } from '../NewArtistBadge';

export function SpotifyAnchor({
  children,
  className,
  href,
  label,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  /** For links whose only content is a picture. */
  label?: string;
}) {
  return (
    <a
      aria-label={label}
      className={cx('stats__itemLink', className)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

/** A favorite album opens in place on the favorite albums page; any other opens on Spotify. */
export function AlbumLink({
  album,
  children,
  className,
  label,
}: {
  album: StatsAlbumRef;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return album.isFavorite ? (
    <PageTransitionLink
      className={cx('stats__itemLink', className)}
      href={albumRoute(album.id)}
      title={label ?? album.name}
    >
      {children}
    </PageTransitionLink>
  ) : (
    <SpotifyAnchor className={className} href={album.url} label={label}>
      {children}
    </SpotifyAnchor>
  );
}

/** Comma-separated artist links, each tagged `New!` when first played in this window. */
export function ArtistLinks({
  artists,
  className = 'stats__meta',
  newArtists,
}: {
  artists: ReadonlyArray<SpotifyLink>;
  /** The type style; artist lists read as meta under a title unless they are the title. */
  className?: string;
  newArtists: ListeningStats['newArtists'];
}) {
  return (
    <Tooltip title={artists.map((artist) => artist.name).join(', ')} whenTruncated>
      <span className={cx(className, 'stats__artists')}>
        {artists.map((artist, i) => (
          <Fragment key={artist.id}>
            {i > 0 ? ', ' : null}
            <SpotifyAnchor href={artist.url}>{artist.name}</SpotifyAnchor>
            {newArtists.ids.includes(artist.id) ? (
              <NewArtistBadge label={newArtists.label} />
            ) : null}
          </Fragment>
        ))}
      </span>
    </Tooltip>
  );
}
