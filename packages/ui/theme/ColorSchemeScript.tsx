import { COLOR_SCHEME_INIT_SCRIPT } from './colorScheme';

/**
 * Blocking head script. Must be rendered under <head> in the root layout so it
 * runs before body paint when an explicit preference is stored.
 *
 * Inline rather than a `src` is intentional twice over: it blocks paint (async or
 * deferred would paint the wrong scheme first) and costs no request, so nothing
 * on the network sits between the HTML arriving and the first paint.
 */
export function ColorSchemeScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: fixed literal, no interpolated input
  return <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_INIT_SCRIPT }} />;
}
