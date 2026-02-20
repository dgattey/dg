import { Box, IconButton, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { ViewTransition } from 'react';
import type { SxObject } from '../theme';
import './sheet-transitions.css';

const sheetContainerSx: SxObject = {
  background: 'var(--mui-palette-background-default)',
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.08), 0 -1px 8px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '60vh',
  overflow: 'hidden',
  pb: 4,
};

const stickyHeaderSx: SxObject = {
  alignItems: 'center',
  backdropFilter: 'blur(12px)',
  background: 'color-mix(in srgb, var(--mui-palette-background-default) 85%, transparent)',
  borderBottom: '1px solid var(--mui-palette-divider)',
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  display: 'flex',
  justifyContent: 'space-between',
  position: 'sticky',
  px: 3,
  py: 2,
  top: 0,
  zIndex: 2,
};

const contentSx: SxObject = {
  flexGrow: 1,
  p: 3,
};

interface SheetProps {
  title: string;
  children: ReactNode;
}

/**
 * Sheet wrapper for page content. Wrap a page's content in `<Sheet>` to give it
 * a raised card-like appearance with rounded top corners, a sticky title bar
 * with close button, and View Transition animations for navigation.
 *
 * The Sheet's ViewTransition name ("sheet") overrides the layout's default
 * "page-content" transition, enabling different animation behaviors:
 * - Entering a sheet page: slides up from bottom
 * - Leaving a sheet page: slides down
 * - Sheet-to-sheet navigation: horizontal slide
 */
export function Sheet({ title, children }: SheetProps) {
  return (
    <ViewTransition enter="vt-sheet-enter" exit="vt-sheet-exit" name="sheet" share="vt-sheet-share">
      <Box sx={sheetContainerSx}>
        <Stack direction="row" sx={stickyHeaderSx}>
          <Typography component="h1" variant="h1">
            {title}
          </Typography>
          <IconButton aria-label="Close" component={NextLink} href="/" size="small">
            <X size={20} />
          </IconButton>
        </Stack>
        <Box sx={contentSx}>{children}</Box>
      </Box>
    </ViewTransition>
  );
}
