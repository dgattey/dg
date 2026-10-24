'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import {
  enableRootPageViewTransition,
  setViewTransitionScrollOffset,
} from '@dg/ui/core/transitions/pageScrollMemory';
import { pageTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import type { StickerInks } from './logoMark';
import { StickerMark } from './StickerMark';

const markInks: StickerInks = {
  dot: 'var(--vermilion)',
  letter: 'var(--viridian)',
  mat: 'var(--cream)',
};

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
    <Link
      className="chrome__logo"
      href={homeRoute}
      onClick={handleClick}
      transitionTypes={pageTransitionTypes('close')}
    >
      <StickerMark inks={markInks} label="dg." />
    </Link>
  );
}
