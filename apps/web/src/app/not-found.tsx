import ClassicLayout from './(classic)/layout';
import ClassicNotFound, { metadata as classicNotFoundMetadata } from './(classic)/not-found';

export const metadata = classicNotFoundMetadata;

/**
 * Unmatched URLs render outside every route group, so this wraps the classic 404 in its chrome.
 * Flag-on requests never get here: the proxy rewrites them into the redesign catch-all.
 */
export default function NotFound() {
  return (
    <ClassicLayout>
      <ClassicNotFound />
    </ClassicLayout>
  );
}
