import { FaIcon } from 'components/FaIcon';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';

type SpotifyLogoProps = {
  trackTitle: string;
  url: string;
};

/**
 * Creates an element that shows a Spotify logo + a link to a track
 */
export function SpotifyLogo({ trackTitle, url }: SpotifyLogoProps) {
  const link = useLinkWithName('Spotify', { title: trackTitle, url });
  return link ? (
    <Link
      {...link}
      isExternal
      href={link.url}
      linkProps={{
        color: 'secondary',
      }}
      sx={{
        '&&': {
          fontSize: '3rem',
        },
        lineHeight: 1,
        margin: 0,
        alignSelf: 'flex-start',
      }}
    >
      <FaIcon icon={faSpotify} />
    </Link>
  ) : null;
}
