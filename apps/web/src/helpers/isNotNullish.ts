/**
 * Typeguards away null values to return you a real value.
 */
export function isNotNullish<Type>(value: Type | null | undefined): value is NonNullable<Type> {
  return Boolean(value);
}
