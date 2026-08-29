import { collageAlbumCardTreatment } from '../collageAlbumCardTreatments';

describe('collageAlbumCardTreatment', () => {
  it('cycles tones every eight cards and layouts every six', () => {
    expect(collageAlbumCardTreatment(8).tone).toBe(collageAlbumCardTreatment(0).tone);
    expect(collageAlbumCardTreatment(6).tiltDeg).toBe(collageAlbumCardTreatment(0).tiltDeg);
    expect(collageAlbumCardTreatment(8).tiltDeg).not.toBe(collageAlbumCardTreatment(0).tiltDeg);
  });

  it('repeats the combined treatment every 24 cards', () => {
    expect(collageAlbumCardTreatment(24)).toEqual(collageAlbumCardTreatment(0));
  });
});
