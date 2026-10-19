import './layouts/error.css';
import type { Metadata } from 'next';
import { ErrorLayout } from './layouts/ErrorLayout';

export const metadata: Metadata = {
  description: 'Sorry, could not find that page.',
  title: 'Page not found',
};

export default function NotFound() {
  return <ErrorLayout statusCode={404} />;
}
