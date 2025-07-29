import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Link } from 'ui/dependent/Link';
import { FaIcon } from 'ui/icons/FaIcon';
import { useLinkWithName } from '../../hooks/useLinkWithName';

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
      href={link.url}
      isExternal={true}
      linkProps={{
        color: 'secondary',
      }}
      sx={{
        '&&': {
          fontSize: '3rem',
        },
        alignSelf: 'flex-start',
        lineHeight: 1,
        margin: 0,
      }}
    >
      <FaIcon icon={faSpotify} />
    </Link>
  ) : null;
}
