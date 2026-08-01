import type { NextRequest } from 'next/server';

/**
 * Detects App Router Flight/RSC or prefetch requests.
 *
 * Next.js strips internal Flight headers (`rsc`, `next-router-state-tree`,
 * `next-router-prefetch`) from the `request` instance inside Proxy, so those
 * headers alone are unreliable. RSC fetches still advertise
 * `Accept: text/x-component`, which Proxy can see.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy#rsc-requests-and-rewrites
 */
export function isNextFlightRequest(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? '';
  return (
    accept.includes('text/x-component') ||
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch'
  );
}
