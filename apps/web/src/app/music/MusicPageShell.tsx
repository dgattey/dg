import type { ReactNode } from 'react';
import type { Backdrop } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { cx } from '../collage/paperVars';

type Props = {
  backdrop: Backdrop;
  children: ReactNode;
  className?: string;
  title: string;
};

/**
 * Shared frame for every music page. It stays synchronous and keeps the title
 * outside any Suspense boundary, so the title commits in the same render as the
 * outgoing page and the view transition has both snapshots to morph between.
 * Pages pass their data behind their own Suspense as children.
 */
export function MusicPageShell({ backdrop, children, className, title }: Props) {
  return (
    <section aria-label={title} className={cx('collageBackdropHost', 'music__layout', className)}>
      <CollageBackdrop backdrop={backdrop} />
      <CutLetters className="collagePageTitle" text={title} />
      {children}
    </section>
  );
}
