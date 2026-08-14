import { ForestHomepage } from '../home/forest/ForestHomepage';
import { generateHomepageMetadata } from '../home/homepageMetadata';

export const generateMetadata = generateHomepageMetadata;

/**
 * The walkable island homepage, behind `interactive-redesign`.
 *
 * Not a public URL: the proxy evaluates the flag and rewrites `/` to a seeded
 * path under here, and a direct hit is redirected home so this never becomes a
 * second homepage. This unsuffixed route prerenders the default island so the
 * build always has complete HTML. Live visits use `/interactive-home/s/:seed`.
 */
export default function Page() {
  return <ForestHomepage />;
}
