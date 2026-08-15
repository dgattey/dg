import { FOREST_ABOUT_IMAGE_PX } from '../forestMaterials';

describe('ForestIntroSlots', () => {
  it('asks Next for a source large enough that a 1440 crop of the board is sharp', () => {
    expect(FOREST_ABOUT_IMAGE_PX).toBeGreaterThanOrEqual(720);
  });
});
