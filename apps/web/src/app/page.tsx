import { Homepage } from './home/Homepage';
import { generateHomepageMetadata } from './home/homepageMetadata';

export const generateMetadata = generateHomepageMetadata;

export default function Page() {
  return <Homepage />;
}
