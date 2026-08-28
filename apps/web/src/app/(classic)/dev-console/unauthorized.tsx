import { homeRoute } from '@dg/shared-core/routes/app';
import { redirect } from 'next/navigation';

/**
 * Canonical Next.js unauthorized boundary for the dev console. When
 * `unauthorized()` is called (e.g. from the page's auth check), this
 * component redirects to the home page instead of showing a dead-end
 * 401 page.
 *
 * This serves as defense-in-depth behind the proxy's Basic Auth check,
 * catching any case where the page renders without valid credentials.
 */
export default function Unauthorized() {
  redirect(homeRoute);
}
