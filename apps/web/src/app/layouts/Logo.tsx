'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_BOUNCY, TIMING_BOUNCY } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { usePathname } from 'next/navigation';
import type { CSSProperties, MouseEvent } from 'react';
import type { StickerInks } from './logoMark';
import { StickerMark } from './StickerMark';

const markStyle: CSSProperties = {
  display: 'block',
  height: '1.15em',
  width: 'auto',
};

const markInks: StickerInks = {
  dot: 'var(--vermilion)',
  letter: 'var(--viridian)',
  mat: 'var(--cream)',
};

const logoLinkSx: SxObject = {
  '&:focus-visible': {
    outline: '-webkit-focus-ring-color auto 1px',
  },
  '&:hover': {
    textDecoration: 'none',
    transform: 'scale(1.05)',
  },
  alignItems: 'center',
  color: 'var(--ink)',
  display: 'flex',
  flexShrink: 0,
  fontSize: '2.25em',
  justifyContent: 'center',
  lineHeight: 1,
  padding: 0.5,
  textDecoration: 'none',
  transition: createTransition(['filter', 'transform'], TIMING_BOUNCY, EASING_BOUNCY),
  willChange: 'transform',
};

export function Logo() {
  const pathname = usePathname() ?? '/';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === homeRoute) {
      event.preventDefault();
      window.scrollTo({ behavior: 'smooth', top: 0 });
    }
  };

  return (
    <Link
      className="chrome__logo"
      href={homeRoute}
      onClick={handleClick}
      sx={logoLinkSx}
      transitionTypes={pageTransitionTypes('close')}
    >
      <StickerMark inks={markInks} label="dg." style={markStyle} />
    </Link>
  );
}
