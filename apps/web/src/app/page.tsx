import { Homepage } from './home/Homepage';
import { generateHomepageMetadata } from './home/homepageMetadata';

export const generateMetadata = generateHomepageMetadata;

/**
 * The card grid homepage.
 *
 * There is no flag read here on purpose. `interactive-redesign` is evaluated in
 * the proxy, which rewrites to the interactive route when it is on, so this
 * route has nothing request-time in it and prerenders to complete HTML — the
 * grid is in the server response whether or not scripts run.
 */
export default function Page() {
  return <Homepage />;
}
