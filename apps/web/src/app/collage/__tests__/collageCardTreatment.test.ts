import { collageCardTreatment } from '../collageCardTreatment';

describe('collageCardTreatment', () => {
  it('cycles tones every seven cards and layouts every six', () => {
    expect(collageCardTreatment(7).tone).toBe(collageCardTreatment(0).tone);
    expect(collageCardTreatment(6).tiltDeg).toBe(collageCardTreatment(0).tiltDeg);
    expect(collageCardTreatment(8).tiltDeg).not.toBe(collageCardTreatment(0).tiltDeg);
  });

  it('repeats the combined treatment every 42 cards', () => {
    expect(collageCardTreatment(42)).toEqual(collageCardTreatment(0));
  });
});
