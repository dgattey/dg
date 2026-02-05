/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value[0]?.toLocaleUpperCase() + value.slice(1);
}
