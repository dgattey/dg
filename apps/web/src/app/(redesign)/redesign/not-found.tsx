import { metadata as notFoundMetadata } from '../../(classic)/not-found';
import { ErrorLayout } from '../../layouts/ErrorLayout';

export const metadata = notFoundMetadata;

export default function NotFound() {
  return <ErrorLayout statusCode={404} surface="collage" />;
}
