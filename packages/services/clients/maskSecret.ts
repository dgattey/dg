export function maskSecret(value: string | null | undefined, visibleChars = 3) {
  if (!value) {
    return value;
  }
  return `${value.slice(0, visibleChars)}...`;
}
