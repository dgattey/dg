import type { RouteGroup } from '@dg/maps/bay/bayRoutes';

/** Route groups as paths for `BayMap`'s ink layer. */
export function RouteInk({ groups }: { groups: ReadonlyArray<RouteGroup> }) {
  return groups.map(({ d, sport, year }) => (
    <path className="bayMap__route" d={d} data-sport={sport} key={`${year}-${sport}`} />
  ));
}
