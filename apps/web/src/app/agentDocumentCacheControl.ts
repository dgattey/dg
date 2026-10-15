/**
 * CDN policy for Markdown twins, `/llms*.txt`, and `.well-known` documents.
 * Every CDN miss on a dynamic handler runs a function, and agents can read an
 * hour-old copy.
 */
export const AGENT_DOCUMENT_CACHE_CONTROL = 's-maxage=3600, stale-while-revalidate=86400';
