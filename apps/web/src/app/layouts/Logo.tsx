'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Button } from '@mui/material';
import { usePathname } from 'next/navigation';
import { isMusicDestinationPath } from './musicHeaderDestinations';

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
 * Logo that scrolls to top on home page, or links to home on other pages.
 * Leaving a music destination uses the close view-transition type so the page
 * falls away instead of snapping.
 */
export function Logo({ surface = 'classic' }: { surface?: SiteSurface }) {
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  if (surface === 'collage') {
    if (pathname === homeRoute) {
      return (
        <button onClick={scrollToTop} type="button">
          dg.
        </button>
      );
    }
    return (
      <Link
        href={homeRoute}
        sx={{ color: 'inherit', textDecoration: 'none' }}
        title="Home"
        transitionTypes={
          isMusicDestinationPath(pathname) ? pageTransitionTypes('close') : undefined
        }
      >
        dg.
      </Link>
    );
  }

  if (pathname === homeRoute) {
    return (
      <Button disableRipple={true} onClick={scrollToTop} sx={logoButtonSx}>
        dg.
      </Button>
    );
  }

  return (
    <Link
      href={homeRoute}
      sx={logoLinkMergedSx}
      transitionTypes={isMusicDestinationPath(pathname) ? pageTransitionTypes('close') : undefined}
    >
      dg.
    </Link>
  );
}
