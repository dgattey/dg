'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import type { MouseEvent } from 'react';
import { usePublicPathname } from './usePublicPathname';

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

const logoLinkMergedSx: SxObject = {
  ...logoTextStyles,
  ...paddingStyles,
  ...logoLinkSx,
};

/**
 * Logo that scrolls to top on home page, or links to home on other pages.
 * Always renders as a Link so the prerendered shell and client hydration
 * produce identical DOM elements regardless of pathname resolution.
 * Going home uses the close view-transition type so the page falls away and
 * its heading morphs into the homepage headline instead of snapping.
 */
export function Logo({ surface = 'classic' }: { surface?: SiteSurface }) {
  const pathname = usePublicPathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === homeRoute) {
      event.preventDefault();
      window.scrollTo({ behavior: 'smooth', top: 0 });
    }
  };

  if (surface === 'collage') {
    return (
      <Link
        href={homeRoute}
        onClick={handleClick}
        sx={{ color: 'inherit', textDecoration: 'none' }}
        title="Home"
        transitionTypes={pageTransitionTypes('close')}
      >
        dg.
      </Link>
    );
  }

  return (
    <Link
      href={homeRoute}
      onClick={handleClick}
      sx={logoLinkMergedSx}
      transitionTypes={pageTransitionTypes('close')}
    >
      dg.
    </Link>
  );
}
