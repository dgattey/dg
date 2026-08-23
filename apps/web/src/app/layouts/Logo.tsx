'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Button, Typography } from '@mui/material';
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

const wordmarkResetSx: SxObject = {
  '&:focus-visible': {
    background: 'none',
    boxShadow: 'none',
    outline: '-webkit-focus-ring-color auto 1px',
  },
  '&:hover': {
    background: 'none',
    boxShadow: 'none',
    textDecoration: 'none',
  },
  background: 'none',
  boxShadow: 'none',
  color: 'var(--mui-palette-text-primary)',
  flexShrink: 0,
  minWidth: 0,
  padding: 0,
  textTransform: 'none',
};

type LogoProps = {
  /**
   * `classic` is the flag-off bubble mark. `wordmark` sits in the greenhouse
   * bar and inherits the surface type scale.
   */
  appearance?: 'classic' | 'wordmark';
};

/**
 * Logo that scrolls to top on home page, or links to home on other pages.
 * Leaving a music destination uses the close view-transition type so the page
 * falls away instead of snapping.
 */
export function Logo({ appearance = 'classic' }: LogoProps = {}) {
  const pathname = usePathname() ?? '';
  const isHome = pathname === homeRoute || pathname.startsWith('/greenhouse/');

  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  if (appearance === 'wordmark') {
    if (isHome) {
      return (
        <Button disableRipple={true} onClick={scrollToTop} sx={wordmarkResetSx} variant="text">
          <Typography component="span" variant="h4">
            dg.
          </Typography>
        </Button>
      );
    }
    return (
      <Link
        href={homeRoute}
        sx={wordmarkResetSx}
        transitionTypes={
          isMusicDestinationPath(pathname) ? pageTransitionTypes('close') : undefined
        }
        variant="h4"
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
