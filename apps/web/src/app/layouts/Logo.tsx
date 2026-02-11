'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Button } from '@mui/material';
import { usePathname } from 'next/navigation';

const paddingStyles: SxObject = {
  paddingBlock: 1,
  paddingInline: 1.5,
};

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo. Scales up on hover.
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
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
  ...createBouncyTransition(['color', 'transform']),
  background: 'none',
  willChange: 'transform',
};

const logoLinkSx: SxObject = {
  '&:hover': {
    textDecoration: 'none',
  },
  flexShrink: 0,
  textDecoration: 'none',
  textWrap: 'nowrap',
};

const logoButtonSx: SxObject = {
  ...logoTextStyles,
  ...paddingStyles,
  flexShrink: 0,
};

const logoLinkMergedSx: SxObject = {
  ...logoTextStyles,
  ...paddingStyles,
  ...logoLinkSx,
};

/**
 * Logo that scrolls to top on home page, or links to home on other pages
 */
export function Logo() {
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
