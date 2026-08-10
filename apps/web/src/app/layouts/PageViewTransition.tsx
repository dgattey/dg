'use client';

import { takePageOrigin } from '@dg/ui/core/transitions/pageScrollMemory';
import { pageViewTransitionProps } from '@dg/ui/core/transitions/pageTransitions';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLayoutEffect, ViewTransition } from 'react';
import { markClientHydrated } from './clientHydrated';

/**
 * Gives each route its own view transition boundary. Keying by pathname is
 * what makes React animate the outgoing page out and the incoming page in;
 * a single persistent boundary would instead morph one snapshot into the
 * other and squash them, since page heights differ wildly.
 */
export function PageViewTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Scroll has to land before the browser photographs the new page, so this
  // is a layout effect rather than an effect.
  useLayoutEffect(() => {
    markClientHydrated();
    const scrollY = takePageOrigin(pathname);
    if (scrollY !== null) {
      window.scrollTo({ behavior: 'instant', top: scrollY });
    }
  }, [pathname]);

  return (
    <ViewTransition key={pathname} {...pageViewTransitionProps}>
      {/*
       * One wrapper so the boundary has a single child. React names every
       * direct child itself, which overwrites any `view-transition-name` the
       * page set — the heading loses `page-title`, stops pairing with the
       * footer control, and dips away with the page instead of morphing into
       * it. Naming this wrapper leaves the page's own names intact and makes
       * the page rise and fall as one piece.
       */}
      <div>{children}</div>
    </ViewTransition>
  );
}
