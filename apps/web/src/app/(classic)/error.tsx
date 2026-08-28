'use client';

import { ErrorLayout } from './layouts/ErrorLayout';

/**
 * Keep error pages simple and avoid dynamic data fetching to prevent hydration issues.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  void reset;
  return <ErrorLayout statusCode={500} />;
}
