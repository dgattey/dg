import type { FramedPath } from './routeFrame';

export function RouteSvgPaths({
  casingOpacity,
  casingStroke,
  casingWidth,
  lineWidth,
  paths,
}: {
  casingOpacity?: number;
  casingStroke: string;
  casingWidth: number;
  lineWidth: number;
  paths: ReadonlyArray<FramedPath>;
}) {
  return (
    <>
      {paths.map(({ d, tone }) => (
        <path
          d={d}
          fill="none"
          key={`casing-${tone}`}
          stroke={casingStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={casingOpacity}
          strokeWidth={casingWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {paths.map(({ d, tone }) => (
        <path
          d={d}
          data-tone={tone}
          fill="none"
          key={tone}
          stroke={`var(--${tone})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
}
