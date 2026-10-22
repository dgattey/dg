import { paperSurfaceVars } from '../paperVars';

describe('paperSurfaceVars', () => {
  it('rounds a cut edge corner by corner, so nested panels can offset each one', () => {
    expect(paperSurfaceVars('cream', 'quad-a')).toMatchObject({
      '--clip': 'none',
      '--edge-bl': 'var(--quad-a-bl)',
      '--edge-br': 'var(--quad-a-br)',
      '--edge-radius': 'var(--quad-a)',
      '--edge-tl': 'var(--quad-a-tl)',
      '--edge-tr': 'var(--quad-a-tr)',
    });
  });

  /** Paper inherits its parent's variables, so torn paper must zero the corners it doesn't use. */
  it('clips a torn edge to its polygon with square corners', () => {
    expect(paperSurfaceVars('ochre', 'torn-c')).toMatchObject({
      '--clip': 'var(--torn-c)',
      '--edge-bl': '0px',
      '--edge-br': '0px',
      '--edge-radius': '0px',
      '--edge-tl': '0px',
      '--edge-tr': '0px',
    });
  });

  it('carries the tone and tilt alongside the edge', () => {
    expect(paperSurfaceVars('black', 'soft-b', 2)).toMatchObject({
      '--on': 'var(--cream)',
      '--pc': 'var(--black)',
      '--r': '2deg',
    });
  });
});
