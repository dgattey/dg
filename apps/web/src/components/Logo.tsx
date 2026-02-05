'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import { GlassContainer } from '@dg/ui/core/GlassContainer';
import { ScrollIndicatorContext } from '@dg/ui/core/ScrollIndicatorContext';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, Button } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

const paddingStyles: SxObject = {
  paddingBlock: 1.5,
  paddingInlineEnd: 3,
  paddingInlineStart: 2.5,
};

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Has background on scroll + scales down a bit.
 */
const logoTextStyles: SxObject = {
  '&': {
    fontSize: '2.25em',
  },
  '&:focus-visible': {
    background: 'none',
    boxShadow: 'none',
    outline: '-webkit-focus-ring-color auto 1px',
  },
  '&:hover': {
    background: 'none',
    boxShadow: 'none',
    color: 'var(--mui-palette-primary-dark)',
    transform: 'scale(1.05)',
  },
  alignItems: 'center',
  boxShadow: 'none',
  color: 'var(--mui-palette-primary-main)',
  display: 'flex',
  fontVariationSettings: "'wght' 800, 'wdth' 120",
  justifyContent: 'center',
  letterSpacing: '-0.12em',
  lineHeight: 1,
  ...createBouncyTransition(['color', 'transform']),
  background: 'none',
  willChange: 'transform',
};

const logoWrapperSx: SxObject = {
  alignItems: 'center',
  display: 'inline-flex',
  position: 'relative',
};

const containerSx: SxObject = {
  position: 'relative',
  zIndex: 1,
};

const logoLinkSx: SxObject = {
  textDecoration: 'none',
};

const logoButtonSx: SxObject = {
  ...logoTextStyles,
  ...containerSx,
  ...paddingStyles,
};

const logoLinkMergedSx: SxObject = {
  ...logoTextStyles,
  ...containerSx,
  ...paddingStyles,
  ...logoLinkSx,
};

const glassContainerSx: SxObject = {
  ...createBouncyTransition(['opacity', 'transform']),
  borderRadius: '32px',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
  position: 'absolute',
  transform: 'translateX(-100%)',
  willChange: 'transform',
  zIndex: 0,
};

/** Merged glass container styles when scrolled */
const glassContainerScrolledSx: SxObject = {
  ...createBouncyTransition(['opacity', 'transform']),
  borderRadius: '32px',
  inset: 0,
  opacity: 1,
  pointerEvents: 'none',
  position: 'absolute',
  transform: 'translateX(0)',
  willChange: 'transform',
  zIndex: 0,
};

/**
 * The actual logo content - either a button or link depending on route
 */
function LogoContent() {
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  if (pathname === homeRoute) {
    return (
      <Button disableRipple={true} onClick={scrollToTop} sx={logoButtonSx}>
        dg.
      </Button>
    );
  }

  return (
    <Link href={homeRoute} sx={logoLinkMergedSx}>
      dg.
    </Link>
  );
}

/**
 * Logo + scroll to top button, with glass container that appears on scroll
 */
export function Logo() {
  const isScrolled = useContext(ScrollIndicatorContext);

  return (
    <Box sx={logoWrapperSx}>
      <GlassContainer aria-hidden sx={isScrolled ? glassContainerScrolledSx : glassContainerSx} />
      <LogoContent />
    </Box>
  );
}
