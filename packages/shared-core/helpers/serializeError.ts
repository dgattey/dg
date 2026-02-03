import { maskSecret } from './maskSecret';

type SerializedError = {
  message?: string;
  name?: string;
  stack?: string;
  value?: unknown;
};

export const serializeError = (error: unknown): SerializedError => {
  if (error instanceof Error) {
    return {
      message: maskSecret(error.message),
      name: error.name,
      stack: error.stack ? maskSecret(error.stack) : undefined,
    };
  }

  if (typeof error === 'string') {
    return { message: maskSecret(error) };
  }

  return { value: error };
};
