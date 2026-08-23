import { PAGE_TITLE_VIEW_TRANSITION_NAME } from '@dg/ui/core/transitions/pageTransitions';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';

const headingSx: SxObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  justifyContent: 'flex-end',
  minWidth: 0,
  paddingBlockEnd: { xl: 0.5, xs: 0 },
};

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
};

/**
 * Greenhouse page display: the same `h1` serif as the homepage intro, plus a
 * one-line `body1`. Ink matches the intro (`text.primary`), not the teal accent.
 */
export function ListeningHeading({ title, description }: Props) {
  return (
    <Box data-music-heading="" sx={headingSx}>
      <Typography component="h1" sx={titleSx} variant="h1">
        {title}
      </Typography>
      <Typography sx={descriptionSx} variant="body1">
        {description}
      </Typography>
    </Box>
  );
}
