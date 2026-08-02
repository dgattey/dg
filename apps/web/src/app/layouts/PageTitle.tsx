import { PAGE_TITLE_VIEW_TRANSITION_NAME } from '@dg/ui/core/transitions/pageTransitions';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';

const titleSx: SxObject = {
  marginBottom: 3,
  viewTransitionName: PAGE_TITLE_VIEW_TRANSITION_NAME,
};

type PageTitleProps = {
  children: string;
};

/**
 * Page heading that participates in the vinyl → title morph on music
 * destinations. Carries the shared `page-title` view-transition name.
 */
export function PageTitle({ children }: PageTitleProps) {
  return (
    <Typography component="h1" sx={titleSx} variant="h1">
      {children}
    </Typography>
  );
}
