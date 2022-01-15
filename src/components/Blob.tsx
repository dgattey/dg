import * as blobs from 'blobs/v2';

const SIZE = 1000;

/**
 * Creates a fun random blob that's almost a circle but has some randomness, with a size of 200.
 */
const Blob = ({
  className,
  seed,
}: Pick<React.ComponentProps<'svg'>, 'className'> & { seed: number }) => {
  const path = blobs.svgPath({
    seed,
    extraPoints: 7,
    randomness: 2,
    size: SIZE,
  });
  return (
    <svg className={className} viewBox={`0 0 ${SIZE} ${SIZE}`} xmlns="http://www.w3.org/2000/svg">
      <path d={path} />
    </svg>
  );
};

export default Blob;
