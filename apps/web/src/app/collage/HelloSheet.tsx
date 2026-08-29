import type { ReactNode } from 'react';
import { CutOut } from './CutOut';
import { CutOutSymbols } from './CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import styles from './HelloSheet.module.css';

type HelloSheetProps = {
  intro: ReactNode;
  map: ReactNode;
};

export function HelloSheet({ intro, map }: HelloSheetProps) {
  return (
    <section aria-label="Hello" className={styles.sheet}>
      <CutOutSymbols />
      {CUT_OUT_PLACEMENTS.helloSheet.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <div className={styles.grid}>
        {intro}
        {map}
      </div>
    </section>
  );
}
