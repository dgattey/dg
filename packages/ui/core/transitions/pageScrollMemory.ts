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

export function rememberPageOrigin(pathname: string) {
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
