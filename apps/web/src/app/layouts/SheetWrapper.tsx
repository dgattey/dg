'use client';

import { Section } from '@dg/ui/core/Section';
import type { SxObject } from '@dg/ui/theme';
import { Box, Container, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Backdrop overlay that dims the "background" content.
 * Since this is real navigation (old page is gone), we simulate the backdrop
 * with a semi-transparent overlay that gives the illusion of content behind.
 */
const backdropSx: SxObject = {
  backdropFilter: 'blur(4px)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  maxHeight: 'calc(100vh - 72px)', // Leave room for the sticky header
  overflowY: 'auto',
  position: 'fixed',
  right: 0,
  viewTransitionName: 'sheet-content',
  zIndex: 2,
};

/**
 * Handle indicator at top of sheet - visual affordance for dismissal
 */
const handleSx: SxObject = {
  alignSelf: 'center',
  backgroundColor: 'divider',
  borderRadius: 2,
  height: 4,
  marginTop: 1.5,
  width: 36,
};

/**
 * Header area with handle and close button
 */
const sheetHeaderSx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'background.default',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 1,
  position: 'sticky',
  top: 0,
  zIndex: 3,
};

/**
 * Close button row positioned in the top-right of the sheet
 */
const closeButtonRowSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  paddingRight: 1,
  paddingTop: 1,
  width: '100%',
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
const sheetContentSx: SxObject = {
  flex: 1,
  paddingBottom: 4,
};

type Props = {
  children: ReactNode;
  /** Styles to apply to the main section (home page only) */
  mainSectionSx?: SxObject;
};

/**
 * Conditionally wraps page content in a sheet overlay for non-home pages.
 * Uses the View Transitions API for smooth slide-up/down animations.
 *
 * - Home page (`/`): Renders children in standard Section/Container layout
 * - All other pages: Wraps children in a sheet with backdrop, rounded corners,
 *   close button, and slide-up animation
 */
export function SheetWrapper({ children, mainSectionSx }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  // Home page - render with standard layout
  if (isHomePage) {
    // Combine mainSectionSx with view transition name
    const sectionSx: SxObject = {
      ...mainSectionSx,
      viewTransitionName: 'main-content',
    };

    return (
      <Section sx={sectionSx}>
        <Container>
          <main>{children}</main>
        </Container>
      </Section>
    );
  }

  const handleBackdropClick = () => {
    router.push('/');
  };

  // Non-home pages - wrap in sheet
  return (
    <>
      {/* Backdrop - clicking navigates home */}
      <Box aria-hidden="true" onClick={handleBackdropClick} sx={backdropSx} />

      {/* Sheet container */}
      <Box sx={sheetContainerSx}>
        {/* Sheet header with handle and close button */}
        <Box sx={sheetHeaderSx}>
          {/* Visual handle indicator */}
          <Box sx={handleSx} />

          {/* Close button row */}
          <Container>
            <Box sx={closeButtonRowSx}>
              <IconButton
                aria-label="Close and return home"
                component={Link}
                href="/"
                size="small"
                sx={closeButtonSx}
              >
                <X size={20} />
              </IconButton>
            </Box>
          </Container>
        </Box>

        {/* Content area */}
        <Container sx={sheetContentSx}>
          <main>{children}</main>
        </Container>
      </Box>
    </>
  );
}
