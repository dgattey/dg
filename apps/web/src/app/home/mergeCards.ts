/**
 * Merges the projects and other cards into a single array, where the other cards
 * are interleaved between the project cards at the given indices.
 *
 * Shared by both homepage layouts so the grid and the forest map order their
 * content identically — the forest's clearings follow the same walk.
 */
export function mergeCards<T>(
  projects: Array<T>,
  preciselyPlacedCards: Map<number, T>,
): Array<T | undefined> {
  const projectsIterator = projects.values();
  return Array.from(
    { length: projects.length + preciselyPlacedCards.size },
    (_, i) => preciselyPlacedCards.get(i) ?? projectsIterator.next().value,
  );
}
