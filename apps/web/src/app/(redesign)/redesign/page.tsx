import { generateMetadata as generateHomeMetadata } from '../../(classic)/page';
import { Homepage } from '../../home/Homepage';

export const generateMetadata = generateHomeMetadata;

export default function Page() {
  return <Homepage surface="collage" />;
}
