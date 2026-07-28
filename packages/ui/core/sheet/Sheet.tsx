import { Box, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { ViewTransition } from 'react';
import { Link } from '../../dependent/Link';
import type { SxObject } from '../../theme';
import { sheetTransitionTypes, sheetViewTransitionProps } from './sheetTransitions';
import './sheetTransitions.css';

const sheetWrapperSx: SxObject = {
  display: 'flex',
  flexDirection: 'column',
};

const sheetContainerSx: SxObject = {
  background: 'var(--mui-palette-background-paper)',
  borderRadius: 8,
  boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.12), 0 -1px 8px rgba(0, 0, 0, 0.06)',
  display: 'flex',
  flexDirection: 'column',
  marginInline: 'auto',
  maxHeight: 'calc(100dvh - 12rem)',
  maxWidth: { lg: 920, md: 700, sm: 510, xl: 1130 },
  overflow: 'hidden',
  width: '100%',
};

const sheetHeaderSx: SxObject = {
  alignItems: 'center',
  backdropFilter: 'blur(12px)',
  background: 'color-mix(in srgb, var(--mui-palette-background-paper) 85%, transparent)',
  borderBottom: '1px solid var(--mui-palette-divider)',
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'space-between',
  px: 3,
  py: 2,
};

const contentSx: SxObject = {
  flexGrow: 1,
  overflowY: 'auto',
  p: 3,
};

const closeLinkSx: SxObject = {
  alignItems: 'center',
  color: 'inherit',
  display: 'inline-flex',
  lineHeight: 0,
  p: 0.5,
};

export type SheetProps = {
  children: ReactNode;
  closeHref: string;
  title: string;
};

/**
 * Raised page chrome with sticky title and close link. Open/close motion comes
 * from React ViewTransition classes driven by sheet transition types.
 */
export function Sheet({ title, closeHref, children }: SheetProps) {
  return (
    <ViewTransition {...sheetViewTransitionProps}>
      <Box sx={sheetWrapperSx}>
        <Box sx={sheetContainerSx}>
          <Stack direction="row" sx={sheetHeaderSx}>
            <Typography component="h1" variant="h1">
              {title}
            </Typography>
            <Link
              href={closeHref}
              sx={closeLinkSx}
              title="Close"
              transitionTypes={sheetTransitionTypes('close')}
            >
              <X size={20} />
            </Link>
          </Stack>
          <Box sx={contentSx}>{children}</Box>
        </Box>
      </Box>
    </ViewTransition>
  );
}
