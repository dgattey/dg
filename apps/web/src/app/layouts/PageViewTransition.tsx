'use client';

import { takeSheetOrigin } from '@dg/ui/core/sheet/sheetScrollMemory';
import { sheetPageViewTransitionProps } from '@dg/ui/core/sheet/sheetTransitions';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLayoutEffect, ViewTransition } from 'react';

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
    const scrollY = takeSheetOrigin(pathname);
    if (scrollY !== null) {
      window.scrollTo({ behavior: 'instant', top: scrollY });
    }
  }, [pathname]);

  return (
    <ViewTransition key={pathname} {...sheetPageViewTransitionProps}>
      {children}
    </ViewTransition>
  );
}
