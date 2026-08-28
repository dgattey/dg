'use client';

import ClassicError from '../../(classic)/error';

export default function RedesignError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ClassicError error={error} reset={reset} />;
}
