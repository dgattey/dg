/**
 * A sheet is a route, so opening one is a push navigation and the App Router
 * lands the page it returns to back at the top. That reads as the page having
 * moved while the sheet was covering it. Remember where the sheet was opened
 * from and put the page back there before the view transition photographs it.
 */

type SheetOrigin = {
  pathname: string;
  scrollY: number;
};

let origin: SheetOrigin | null = null;

export function rememberSheetOrigin(pathname: string) {
  origin = { pathname, scrollY: window.scrollY };
}

/**
 * Returns the offset to restore, once, on arriving back at the page a sheet
 * was opened from. Anywhere else keeps its normal top-of-page landing.
 */
export function takeSheetOrigin(pathname: string) {
  if (origin?.pathname !== pathname) {
    return null;
  }
  const { scrollY } = origin;
  origin = null;
  return scrollY;
}
