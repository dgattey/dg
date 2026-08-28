import ClassicHome, { generateMetadata as generateHomeMetadata } from '../../(classic)/page';

export const generateMetadata = generateHomeMetadata;

export default function Page() {
  return <ClassicHome />;
}
