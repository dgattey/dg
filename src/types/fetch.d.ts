/**
 * Redeclares `fetch` to take a type for the JSON out of the body
 */
declare function fetch<Type = unknown>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<
  Omit<Response, 'json'> & {
    json: () => Promise<{ data: Type }>;
  }
>;
