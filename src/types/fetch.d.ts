type FetchResult<Type> = Omit<Response, 'json'> & { json: () => Promise<Type> };

/**
 * Redeclares `fetch` to take a type for the JSON out of the body
 */
declare function fetch<Type = unknown>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<FetchResult<Type>>;
