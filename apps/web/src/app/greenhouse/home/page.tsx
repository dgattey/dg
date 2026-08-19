import { OrganicGrid } from '@dg/ui/core/OrganicGrid';
import { Homepage } from '../../home/Homepage';
import { generateHomepageMetadata } from '../../home/homepageMetadata';
import { GreenhouseFrame } from '../GreenhouseFrame';

export const generateMetadata = generateHomepageMetadata;

/**
 * Flag-on homepage. Public `/` still prerenders the old grid; the proxy
 * rewrites here when `interactive-redesign` is on.
 */
export default function Page() {
  return (
    <GreenhouseFrame surface="home">
      <Homepage Grid={OrganicGrid} />
    </GreenhouseFrame>
  );
}
