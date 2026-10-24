/**
 * Opening a destination page is a push navigation, and the App Router lands the
 * page it returns to back at the top. That reads as the page having moved while
 * the destination was covering it. Remember where the navigation started and
 * put the page back there before the view transition photographs it.
 */

type PageOrigin = {
  pathname: string;
  scrollY: number;
};

let origin: PageOrigin | null = null;

type ReactViewTransitionDocument = Document & {
  __reactViewTransition?: { finished: Promise<unknown> };
};

export function enableRootPageViewTransition() {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.style.viewTransitionName = 'root';
  const clearWhenDone = () => {
    const active = (document as ReactViewTransitionDocument).__reactViewTransition;
    if (active) {
      void active.finished.finally(() => {
        if (root.style.viewTransitionName === 'root') {
          root.style.viewTransitionName = '';
        }
      });
      return;
    }
    if (root.style.viewTransitionName === 'root') {
      root.style.viewTransitionName = '';
    }
  };
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(clearWhenDone);
  }
}

export function setViewTransitionScrollOffset(scrollY = window.scrollY) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(
      '--vt-scroll-offset',
      `${Math.max(0, Math.round(scrollY))}px`,
    );
  }
}

export function rememberPageOrigin(pathname: string) {
  enableRootPageViewTransition();
  setViewTransitionScrollOffset(window.scrollY);
  origin = { pathname, scrollY: window.scrollY };
}

/**
 * Returns the offset to restore, once, on arriving back at the page a
 * destination was opened from. Anywhere else keeps its normal top-of-page
 * landing.
 */
export function takePageOrigin(pathname: string) {
  if (origin?.pathname !== pathname) {
    return null;
  }
  const { scrollY } = origin;
  origin = null;
  return scrollY;
}
