'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, Container, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Backdrop overlay that dims the "background" content.
 * Since this is real navigation (old page is gone), we simulate the backdrop
 * with a semi-transparent overlay that gives the illusion of content behind.
 */
const backdropSx: SxObject = {
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  bottom: 0,
  left: 0,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 1,
};

/**
 * The sheet container itself - slides up from bottom, has rounded top corners.
 * Uses view-transition-name for animation during navigation.
 */
const sheetContainerSx: SxObject = {
  backgroundColor: 'background.default',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  bottom: 0,
  boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  maxHeight: 'calc(100vh - 80px)', // Leave room for the sticky header
  overflowY: 'auto',
  position: 'fixed',
  right: 0,
  viewTransitionName: 'sheet-content',
  zIndex: 2,
};

/**
 * Close button positioned in the top-right of the sheet
 */
const closeButtonContainerSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  paddingRight: 1,
  paddingTop: 2,
  position: 'sticky',
  top: 0,
  zIndex: 3,
};

const closeButtonSx: SxObject = {
  '&:hover': {
    backgroundColor: 'action.hover',
  },
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
};

/**
 * Main content area with proper padding
 */
const contentSx: SxObject = {
  flex: 1,
  paddingBottom: 4,
  paddingTop: 1,
};

/**
 * Sheet layout component that wraps page content in a modal-like sheet.
 * Uses View Transitions API for smooth slide-up/down animations.
 *
 * Features:
 * - Fixed positioning with backdrop overlay
 * - Rounded top corners for sheet aesthetic
 * - Close button that navigates back to home
 * - Scrollable content area
 * - View transition names for animated navigation
 */
export default function SheetLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleBackdropClick = () => {
    router.push('/');
  };

  return (
    <>
      {/* Backdrop - clicking navigates home */}
      <Box aria-hidden="true" onClick={handleBackdropClick} sx={backdropSx} />

      {/* Sheet container */}
      <Box sx={sheetContainerSx}>
        {/* Close button */}
        <Container>
          <Box sx={closeButtonContainerSx}>
            <IconButton
              aria-label="Close sheet"
              component={Link}
              href="/"
              size="small"
              sx={closeButtonSx}
            >
              <X size={20} />
            </IconButton>
          </Box>
        </Container>

        {/* Content area */}
        <Container sx={contentSx}>{children}</Container>
      </Box>
    </>
  );
}
