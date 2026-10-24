'use client';

import {
  enableRootPageViewTransition,
  takePageOrigin,
} from '@dg/ui/core/transitions/pageScrollMemory';
import { pageViewTransitionProps } from '@dg/ui/core/transitions/pageTransitions';
import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, ViewTransition } from 'react';
import { syncFooterRevealProgress } from './FooterRevealScroll';

const sentinelStyle: CSSProperties = {
  height: 0,
  left: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: 0,
};

/**
 * Triggers a React `<ViewTransition>` on each route change while keeping page
 * content, `.collageSheet`, and `.chrome__footer` in `root` so the browser
 * snapshots only the visible `100vw × 100vh` viewport at any scroll offset.
 */
export function PageViewTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    enableRootPageViewTransition();
    const scrollY = takePageOrigin(pathname);
    if (scrollY !== null) {
      window.scrollTo({ behavior: 'instant', top: scrollY });
    }
    syncFooterRevealProgress();
  }, [pathname]);

  return (
    <>
      <ViewTransition key={pathname} {...pageViewTransitionProps}>
        <div aria-hidden={true} style={sentinelStyle} />
      </ViewTransition>
      <div>{children}</div>
    </>
  );
}
