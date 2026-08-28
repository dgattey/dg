import type { Metadata } from 'next';
import { ErrorLayout } from './layouts/ErrorLayout';

export const metadata: Metadata = {
  description: 'Sorry, could not find that page.',
  title: 'Page not found',
};

/**
 * Error page, for 404s specifically.
 */
export default function NotFound() {
  return <ErrorLayout statusCode={404} />;
}
