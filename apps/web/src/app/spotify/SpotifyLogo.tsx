import { Link } from '@dg/ui/dependent/Link';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';

type SpotifyLogoProps = {
  trackTitle: string;
  url: string;
  color?: string;
  textShadow?: string;
};

const getLogoSx = (color?: string, textShadow?: string): SxObject => ({
  '&&': {
    fontSize: '3rem',
  },
  alignSelf: 'flex-start',
  color,
  lineHeight: 1,
  margin: 0,
  textShadow,
});

/**
 * Creates an element that shows a Spotify logo + a link to a track
 */
export function SpotifyLogo({ trackTitle, url, color, textShadow }: SpotifyLogoProps) {
  return (
    <Link
      href={url}
      isExternal={true}
      sx={getLogoSx(color, textShadow)}
      title={trackTitle}
      variant="h5"
    >
      <FaIcon icon={faSpotify} />
    </Link>
  );
}
