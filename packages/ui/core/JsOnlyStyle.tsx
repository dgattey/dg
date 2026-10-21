/** Marks chrome that cannot do its job without scripting. */
const JS_ONLY_ATTRIBUTE = 'data-js-only';

/**
 * Spread onto a control that is inert without scripting, so it is hidden rather
 * than left on screen pretending to work. Use it only where the control's whole
 * purpose needs JS — never as a shortcut around building a no-script path.
 */
export const jsOnlyProps = { [JS_ONLY_ATTRIBUTE]: true } as const;

/**
 * Hides `jsOnlyProps` chrome when scripting is off.
 *
 * A `<noscript>` stylesheet rather than a class the page's own script strips:
 * browsers that run scripts never parse the contents at all, so there is no
 * marker to race, and browsers that don't apply it before first paint — a class
 * toggled by script flashes the control it is about to remove.
 *
 * Belongs in `<head>`, where `<noscript>` may hold a stylesheet.
 */
export function JsOnlyStyle() {
  return (
    <noscript>
      <style>{`[${JS_ONLY_ATTRIBUTE}]{display:none!important}`}</style>
    </noscript>
  );
}
