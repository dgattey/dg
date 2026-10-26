const encoder = new TextEncoder();

export function timingSafeEqualStrings(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (!left || !right) {
    return false;
  }
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  let mismatch = leftBytes.length ^ rightBytes.length;
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftByte = index < leftBytes.length ? (leftBytes[index] ?? 0) : 0;
    const rightByte = index < rightBytes.length ? (rightBytes[index] ?? 0) : 0;
    mismatch |= leftByte ^ rightByte;
  }
  return mismatch === 0;
}
