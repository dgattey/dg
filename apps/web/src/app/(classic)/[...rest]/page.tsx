import { notFound } from 'next/navigation';

/**
 * Unmatched URLs land here so the 404 renders inside the classic layout. A
 * root-level 404 swaps the whole chrome tree on the way out, and React never
 * starts a view transition for that navigation.
 */
export function generateStaticParams() {
  return [{ rest: ['not-found'] }];
}

export default function CatchAll() {
  notFound();
}
