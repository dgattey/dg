import styles from './paper.module.css';
import type { PaperEdge, PaperTone } from './types';

function cssClass(value: string | undefined): string {
  return value ?? '';
}

export const TONE_CLASS: Record<PaperTone, string> = {
  black: cssClass(styles.toneBlack),
  cerulean: cssClass(styles.toneCerulean),
  chartreuse: cssClass(styles.toneChartreuse),
  cobalt: cssClass(styles.toneCobalt),
  cream: cssClass(styles.toneCream),
  leaf: cssClass(styles.toneLeaf),
  ochre: cssClass(styles.toneOchre),
  olive: cssClass(styles.toneOlive),
  rose: cssClass(styles.toneRose),
  ultramarine: cssClass(styles.toneUltramarine),
  vermilion: cssClass(styles.toneVermilion),
  viridian: cssClass(styles.toneViridian),
};

export const EDGE_CLASS: Record<PaperEdge, string> = {
  'quad-a': cssClass(styles.edgeQuadA),
  'quad-b': cssClass(styles.edgeQuadB),
  'quad-c': cssClass(styles.edgeQuadC),
  'quad-d': cssClass(styles.edgeQuadD),
  'torn-a': cssClass(styles.edgeTornA),
  'torn-b': cssClass(styles.edgeTornB),
  'torn-c': cssClass(styles.edgeTornC),
};
