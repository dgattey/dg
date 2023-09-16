import { CardProps } from '@mui/material';
import { ContentCard, ContentCardProps } from 'components/ContentCard';
import { mixinSx } from 'ui/helpers/mixinSx';

// In px, the min/max size of the card - matches standard size
const MIN_DIMENSION = 297;

// In px, the height of the expanded card
const EXPANDED_HEIGHT = 500;

type MapContentCardProps = {
  isExpanded?: boolean;
  backgroundImageUrl: string | null;
};

/**
 * MapContentCard is a ContentCard that has a background image and
 * expandable support.
 */
export function MapContentCard({
  isExpanded,
  backgroundImageUrl,
  sx,
  ...props
}: MapContentCardProps & ContentCardProps & CardProps) {
  return (
    <ContentCard
      {...props}
      sx={mixinSx(
        (theme) => ({
          border: 'none',
          minHeight: isExpanded ? EXPANDED_HEIGHT : MIN_DIMENSION,
          height: isExpanded ? EXPANDED_HEIGHT : undefined,
          [theme.breakpoints.down('md')]: {
            minHeight: isExpanded ? 360 : 200,
            height: isExpanded ? 360 : 200,
          },
          ...(backgroundImageUrl && {
            backgroundImage: `url('${backgroundImageUrl}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }),
        }),
        sx,
      )}
    />
  );
}
