import { notFound } from 'next/navigation';

/**
 * Cache Components only treats `usePathname()` in the redesign chrome as
 * static when this catch-all has a known param. Without one, the layout has to
 * hide its header and main behind Suspense, which ships them as hidden
 * out-of-order HTML that never shows without JavaScript.
 */
export function generateStaticParams() {
  return [{ rest: ['not-found'] }];
}

export default function CatchAll() {
  notFound();
}
