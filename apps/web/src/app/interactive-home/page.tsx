import { ForestHomepage } from '../home/forest/ForestHomepage';
import { generateHomepageMetadata } from '../home/homepageMetadata';

export const generateMetadata = generateHomepageMetadata;

/**
 * The walkable island homepage, behind `interactive-redesign`.
 *
 * Not a public URL: the proxy evaluates the flag and rewrites `/` here, and a
 * direct hit is redirected home so this never becomes a second homepage. The
 * flag is already decided by the time this renders, so — like `/` — the route
 * has no request-time branch and prerenders the whole world into the HTML.
 */
export default function Page() {
  return <ForestHomepage />;
}
