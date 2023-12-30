const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ERROR_PREFIX = 'Invariant failed';

/**
 * Throws an error if the condition is false. This is used to assert that a
 * condition is true at runtime. The message is stripped out in production.
 * @param condition - The truthy condition to check
 * @param message - The message to throw
 * @throws Throws generic error if condition is false
 */
export function invariant(
  condition: unknown,
  /**
   * Provide a function if the message is too expensive to pass directly
   */
  message: string | (() => string),
): asserts condition {
  if (condition) {
    return;
  }
  if (IS_PRODUCTION) {
    throw new Error(ERROR_PREFIX);
  }
  const resolvedMessage = typeof message === 'function' ? message() : message;
  throw new Error(`${ERROR_PREFIX}: ${resolvedMessage}`);
}
