/**
 * Typeguards away null/undefined values to return you a real value.
 */
export function isNotNullish<Type>(value: Type | null | undefined): value is NonNullable<Type> {
  return value !== undefined && value !== null;
}

/**
 * Typeguard to narrow to a record from unknown
 */
export const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === 'object' && Boolean(input) && !Array.isArray(input);
