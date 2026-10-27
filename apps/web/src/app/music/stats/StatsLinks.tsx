import type { ListeningStats, StatsAlbumRef } from '@dg/services/spotify/fetchListeningStats';
import type { SpotifyLink } from '@dg/services/spotify/spotifyLinks';
import { albumRoute } from '@dg/shared-core/routes/app';
import { Tooltip } from '@dg/ui/core/Tooltip';
import type { TypographyVariant } from '@dg/ui/core/Typography';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { Fragment, type ReactNode } from 'react';
import { cx } from '../../collage/paperVars';
import { type ArtistRowSubject, NewArtistBadge } from '../NewArtistBadge';

export function SpotifyAnchor({
  children,
  className,
  href,
  label,
  variant,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  /** For links whose only content is a picture. */
  label?: string;
  variant?: TypographyVariant;
}) {
  return (
    <a
      aria-label={label}
      className={cx('stats__itemLink', className)}
      data-typography={variant}
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
  variant,
}: {
  album: StatsAlbumRef;
  children: ReactNode;
  className?: string;
  label?: string;
  variant?: TypographyVariant;
}) {
  return album.isFavorite ? (
    <PageTransitionLink
      className={cx('stats__itemLink', className)}
      href={albumRoute(album.id)}
      title={label ?? album.name}
      variant={variant}
    >
      {children}
    </PageTransitionLink>
  ) : (
    <SpotifyAnchor className={className} href={album.url} label={label} variant={variant}>
      {children}
    </SpotifyAnchor>
  );
}

/**
 * Comma-separated artist links. In an artist or album row, each is tagged `New!` when
 * first played in this window.
 */
export function ArtistLinks({
  artists,
  className = 'stats__meta',
  newArtists,
  subject,
  variant = 'meta',
}: {
  artists: ReadonlyArray<SpotifyLink>;
  /** The type style; artist lists read as meta under a title unless they are the title. */
  className?: string;
  newArtists: ListeningStats['newArtists'];
  subject: ArtistRowSubject;
  variant?: TypographyVariant;
}) {
  return (
    <Tooltip title={artists.map((artist) => artist.name).join(', ')} whenTruncated>
      <span className={cx(className, 'stats__artists')} data-typography={variant}>
        {artists.map((artist, i) => (
          <Fragment key={artist.id}>
            {i > 0 ? ', ' : null}
            <SpotifyAnchor href={artist.url}>{artist.name}</SpotifyAnchor>
            {newArtists.ids.includes(artist.id) ? (
              <NewArtistBadge label={newArtists.label} subject={subject} />
            ) : null}
          </Fragment>
        ))}
      </span>
    </Tooltip>
  );
}
