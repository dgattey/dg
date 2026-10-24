'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import {
  enableRootPageViewTransition,
  setViewTransitionScrollOffset,
} from '@dg/ui/core/transitions/pageScrollMemory';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_BOUNCY, TIMING_BOUNCY } from '@dg/ui/helpers/timing';
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

const LOGO_CSS = `
.chrome__logo {
  align-items: center;
  color: var(--ink);
  display: flex;
  flex-shrink: 0;
  font-size: 2.25em;
  justify-content: center;
  line-height: 1;
  padding: 4px;
  text-decoration: none;
  transition: ${createTransition('transform', TIMING_BOUNCY, EASING_BOUNCY)};
  will-change: transform;
}
.chrome__logo:hover {
  text-decoration: none;
  transform: scale(1.05);
}
.chrome__logo:focus-visible {
  outline: -webkit-focus-ring-color auto 1px;
}
`;

export function Logo() {
  const pathname = usePathname() ?? '/';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === homeRoute) {
      event.preventDefault();
      window.scrollTo({ behavior: 'smooth', top: 0 });
      return;
    }
    enableRootPageViewTransition();
    setViewTransitionScrollOffset(window.scrollY);
  };

  return (
    <>
      <style href="dg-logo" precedence="default">
        {LOGO_CSS}
      </style>
      <Link
        className="chrome__logo"
        href={homeRoute}
        onClick={handleClick}
        transitionTypes={pageTransitionTypes('close')}
      >
        <StickerMark inks={markInks} label="dg." style={markStyle} />
      </Link>
    </>
  );
}
