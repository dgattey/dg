import { PAGE_TITLE_VIEW_TRANSITION_NAME } from '@dg/ui/core/transitions/pageTransitions';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import { greenhouseHeadingCardSx } from './greenhouseCardSx';

const titleSx: SxObject = {
  color: 'text.primary',
  margin: 0,
  viewTransitionName: PAGE_TITLE_VIEW_TRANSITION_NAME,
};

const descriptionSx: SxObject = {
  color: 'text.primary',
  margin: 0,
  maxWidth: '36ch',
};

type Props = {
  title: string;
  description: string;
  /** Foliage copy-well name. Parent grid cells may also set this. */
  cell?: string;
};

/**
 * Greenhouse page display: the same `h1` serif as the homepage intro, plus a
 * one-line `body1`, on the intro glass card so the title does not float on
 * the plate.
 */
export function ListeningHeading({ title, description, cell = 'intro' }: Props) {
  return (
    <ContentCard data-greenhouse-cell={cell} data-music-heading="" sx={greenhouseHeadingCardSx}>
      <Typography component="h1" sx={titleSx} variant="h1">
        {title}
      </Typography>
      <Typography sx={descriptionSx} variant="body1">
        {description}
      </Typography>
    </ContentCard>
  );
}
