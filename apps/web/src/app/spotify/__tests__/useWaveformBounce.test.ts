import {
  buildPreRedesignBounceKeyframes,
  WAVEFORM_BOUNCE_BEAT_FREQ,
  WAVEFORM_BOUNCE_DURATION_MS,
  WAVEFORM_BOUNCE_TOTAL_FRAMES,
  waveformBounceLoop,
} from '../useWaveformBounce';

const fixedRand = () => 0.5;

function scaleAt(keyframe: Keyframe): number {
  const match = /scale3d\(([\d.]+),/.exec(String(keyframe.transform));
  return Number(match?.[1]);
}

/**
 * With `fixedRand` the jitter is zero, so only beat pulses push the scale past
 * the breath waves' ~0.0086 peak.
 */
function countBeatPulses(keyframes: Array<Keyframe>): number {
  let pulses = 0;
  let inPulse = false;
  for (const keyframe of keyframes.slice(0, -1)) {
    const isPulse = scaleAt(keyframe) > 1.01;
    if (isPulse && !inPulse) {
      pulses += 1;
    }
    inPulse = isPulse;
  }
  return pulses;
}

describe('waveformBounceLoop', () => {
  it.each([[undefined], [0], [Number.NaN]])(
    'keeps the fixed Tweak C loop when the tempo is %p',
    (bpm) => {
      expect(waveformBounceLoop(bpm)).toEqual({
        beatFreq: WAVEFORM_BOUNCE_BEAT_FREQ,
        durationMs: WAVEFORM_BOUNCE_DURATION_MS,
        sampleEvery: 2,
        totalFrames: WAVEFORM_BOUNCE_TOTAL_FRAMES,
      });
    },
  );

  it.each([[70], [98], [116.13], [128.8], [180]])(
    'fits a whole number of %p BPM beats near the default loop length',
    (bpm) => {
      const { durationMs, totalFrames } = waveformBounceLoop(bpm);
      const beats = (durationMs * bpm) / 60_000;

      expect(beats).toBeCloseTo(Math.round(beats), 9);
      expect(durationMs / Math.round(beats)).toBeCloseTo(60_000 / bpm, 9);
      expect(Math.abs(durationMs - WAVEFORM_BOUNCE_DURATION_MS)).toBeLessThanOrEqual(30_000 / bpm);
      expect(totalFrames).toBe(Math.round((durationMs * 60) / 1000));
    },
  );
});

describe('buildPreRedesignBounceKeyframes', () => {
  it('matches the fixed-beat keyframes exactly when the tempo is unknown', () => {
    expect(buildPreRedesignBounceKeyframes(1, fixedRand, 'upbeat-tempo', undefined)).toEqual(
      buildPreRedesignBounceKeyframes(1, fixedRand),
    );
  });

  it.each([[75], [120], [171]])(
    'lands one beat pulse on every beat at %p BPM with a seamless loop',
    (bpm) => {
      const { durationMs, totalFrames } = waveformBounceLoop(bpm);
      const keyframes = buildPreRedesignBounceKeyframes(1, fixedRand, 'upbeat-tempo', bpm);

      expect(keyframes).toHaveLength(totalFrames + 1);
      expect(keyframes[0]?.offset).toBe(0);
      expect(keyframes.at(-1)?.offset).toBe(1);
      expect(keyframes[0]?.transform).toBe(keyframes.at(-1)?.transform);
      expect(countBeatPulses(keyframes)).toBe(Math.round((durationMs * bpm) / 60_000));
    },
  );

  it('pulses faster for faster tracks', () => {
    const slow = buildPreRedesignBounceKeyframes(1, fixedRand, 'upbeat-tempo', 75);
    const fast = buildPreRedesignBounceKeyframes(1, fixedRand, 'upbeat-tempo', 150);

    expect(countBeatPulses(fast)).toBeGreaterThanOrEqual(countBeatPulses(slow) * 2);
    expect(countBeatPulses(fast)).toBeLessThanOrEqual(countBeatPulses(slow) * 2 + 1);
  });
});
