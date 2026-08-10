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
 * Page heading shared across music destinations. `page-title` pairs sibling
 * headings so they morph in place. It is not paired with the header disc —
 * that FLIP is a thousand-pixel scale from a 48px icon.
 */
export function PageTitle({ children }: PageTitleProps) {
  return (
    <Typography component="h1" sx={titleSx} variant="h1">
      {children}
    </Typography>
  );
}
