'use client';

import { ErrorLayout } from '../../layouts/ErrorLayout';

export default function RedesignError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  void reset;
  return <ErrorLayout statusCode={500} surface="collage" />;
}
