/**
 * Typeguards away null values to return you a real value.
 */
export default function isNotNullish<Type>(
  value: Type | null | undefined,
): value is NonNullable<Type> {
  return !!value;
}
