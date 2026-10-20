'use client';

import './layouts/error.css';
import { ErrorLayout } from './layouts/ErrorLayout';

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
