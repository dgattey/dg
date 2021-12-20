/**
 * Simple wrapper around the native `fetch` for use with `useSWR`. Don't use it alone.
 */
const useFetcher = <ArgsType>(
  input: RequestInfo,
  init?: RequestInit,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
) => fetch(input, init).then((res) => res.json() as Promise<ArgsType>);

export default useFetcher;
