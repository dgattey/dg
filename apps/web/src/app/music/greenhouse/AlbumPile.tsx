import { Image } from '@dg/ui/dependent/Image';
import { Box, Typography } from '@mui/material';
import styles from './albumPile.module.css';
import { GREENHOUSE_STACK_ART_SIZE, GREENHOUSE_STACK_ART_SIZES } from './greenhouseCardSx';

/** Front cover plus 3–5 sleeves, matching the mock's 4–6 deep piles. */
export const GREENHOUSE_PILE_COVERS = 6;

type Props = {
  imageUrl: string;
  name: string;
  /** Plays or songs collapsed into this pile. Hidden when zero. */
  count?: number;
  countKind?: 'song' | 'play';
};

function countLabel(count: number, kind: 'song' | 'play') {
  const noun = kind === 'play' ? 'play' : 'song';
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

/**
 * One greenhouse pile: 4–6 covers offset a few pixels and rotated ±2–4°,
 * front cover fully visible, optional count pill. Fan-out is CSS only.
 */
export function AlbumPile({ imageUrl, name, count = 0, countKind = 'song' }: Props) {
  const sleeveCount = Math.min(Math.max(count > 1 ? count - 1 : 4, 3), 5);
  const depths = Array.from({ length: sleeveCount + 1 }, (_, index) => sleeveCount - index);

  return (
    <Box className={styles.pile} data-album-pile="">
      <Box className={styles.stage}>
        {depths.map((depth) => (
          <Box className={styles.cover} data-depth={depth} key={depth}>
            <Image
              alt={depth === 0 ? name : ''}
              fill={true}
              height={GREENHOUSE_STACK_ART_SIZE}
              sizes={GREENHOUSE_STACK_ART_SIZES}
              url={imageUrl}
              width={GREENHOUSE_STACK_ART_SIZE}
            />
            {depth > 0 ? <Box className={styles.scrim} /> : null}
            {depth === 0 && count > 0 ? (
              <Typography className={styles.pill} component="span" variant="caption">
                {countLabel(count, countKind)}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
