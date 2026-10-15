import { usePathname } from 'next/navigation';
import { publicPathFromRedesign } from '../../redesignRouting';

/**
 * The collage prerenders under the redesign prefix and the proxy rewrites
 * public URLs onto it, so `usePathname()` reads `/redesign/...` while
 * prerendering but the public path when a request resumes that shell and in
 * the browser. Anything that renders or keys from the path has to use the
 * public one, or the shell won't match what resumes and hydrates on top of it.
 */
export function usePublicPathname(): string {
  const pathname = usePathname();
  return publicPathFromRedesign(pathname) ?? pathname;
}
