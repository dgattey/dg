/**
 * Joins a list of items into a string, separated by a conjunction.
 */
export function formattedList(items: Array<string>, conjunction: 'or' | 'and' = 'and'): string {
  const lastItem = items[items.length - 1];
  if (!lastItem || items.length < 2) {
    return items.join('');
  }
  const itemsExceptLast = items.slice(0, -1);
  const addComma = items.length > 2;
  return `${itemsExceptLast.join(', ')}${addComma ? ',' : ''} ${conjunction} ${lastItem}`;
}
