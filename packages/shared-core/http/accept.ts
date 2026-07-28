/**
 * HTTP Accept header parsing helpers for content negotiation.
 * Follows RFC 9110 §12.4–12.5 preference matching used by acceptmarkdown.com.
 */

export type AcceptEntry = {
  type: string;
  q: number;
  specificity: number;
};

/**
 * Parses an Accept header into typed entries, preserving client order for
 * tie-breaks when q-values are equal.
 */
export function parseAccept(header: string): Array<AcceptEntry> {
  return header
    .split(',')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const parts = raw.split(';').map((part) => part.trim());
      const type = (parts[0] ?? '*/*').toLowerCase();
      let q = 1;
      for (const param of parts.slice(1)) {
        const separator = param.indexOf('=');
        if (separator < 0) {
          continue;
        }
        const name = param.slice(0, separator).trim().toLowerCase();
        if (name !== 'q') {
          continue;
        }
        const parsed = Number(param.slice(separator + 1).trim());
        if (Number.isFinite(parsed)) {
          q = Math.max(0, Math.min(1, parsed));
        }
      }
      const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
      return { q, specificity, type };
    });
}

const matches = (entry: AcceptEntry, candidate: string): boolean => {
  if (entry.type === '*/*') {
    return true;
  }
  if (entry.type.endsWith('/*')) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
};

/**
 * Picks the preferred content type from `produces` according to Accept.
 * Returns null when every produced type is explicitly rejected or unmatched.
 * When Accept is missing/empty, returns the first produced type.
 */
export function preferredType(
  header: string | null,
  produces: ReadonlyArray<string>,
): string | null {
  if (!header?.trim()) {
    return produces[0] ?? null;
  }

  const entries = parseAccept(header);
  if (entries.length === 0) {
    return produces[0] ?? null;
  }

  let bestType: string | null = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;

  for (const candidate of produces) {
    let matched: AcceptEntry | null = null;
    let matchedPosition = Number.POSITIVE_INFINITY;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (!entry || !matches(entry, candidate)) {
        continue;
      }
      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && index < matchedPosition)
      ) {
        matched = entry;
        matchedPosition = index;
      }
    }

    if (matched === null || matched.q <= 0) {
      continue;
    }

    if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      bestType = candidate;
    }
  }

  return bestType;
}

/**
 * True when Accept explicitly lists `candidate` with q > 0.
 */
export function hasExplicitType(header: string | null, candidate: string): boolean {
  if (!header?.trim()) {
    return false;
  }
  return parseAccept(header).some((entry) => entry.type === candidate.toLowerCase() && entry.q > 0);
}
