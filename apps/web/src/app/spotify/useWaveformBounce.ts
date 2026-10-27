import { useEffect, useRef } from 'react';

export type WaveformBounceTweak = 'softened-jitter' | 'pure-breath' | 'upbeat-tempo';

type WaveformBounceOptions = {
  /**
   * Whether the animation is active
   */
  isPlaying: boolean;
  /**
   * Scale multiplier for the animation intensity (default: 1)
   */
  intensity?: number;
  /**
   * Optional smoothing / tempo tweak on top of the pre-redesign e5174284 equation
   * (defaults to 'upbeat-tempo' — Tweak C at ~91 BPM / beatFreq = 0.95)
   */
  tweak?: WaveformBounceTweak;
  /**
   * Track tempo. When known, every beat pulse lands on a real beat; otherwise
   * the bounce keeps the tweak's fixed beat.
   */
  bpm?: number;
};

/**
 * 1,308-frame (`21,800ms` at 60Hz) compositor trajectory of the pre-redesign
 * (`e5174284`) waveform bounce simulation stepped up to Tweak C (`beatFreq = 0.95`,
 * `~91 BPM`, with proportional `0.52` and `0.41` dual breath waves, 2-stage
 * low-pass micro-shimmer, and 5-frame smoothed rotational beat attack).
 * Running as a single `iterations: Infinity` Web Animation keeps the exact
 * organic feel 100% on the GPU compositor thread in Firefox and Chrome.
 */
export const WAVEFORM_BOUNCE_TOTAL_FRAMES = 1308;
export const WAVEFORM_BOUNCE_DURATION_MS = (WAVEFORM_BOUNCE_TOTAL_FRAMES * 1000) / 60;
export const WAVEFORM_BOUNCE_BEAT_FREQ = 0.95;

/**
 * Simulation clock advance per 60Hz frame; `beatFreq` is in radians per unit.
 */
const SIM_TIME_PER_FRAME = 0.16;

type WaveformBounceLoop = {
  beatFreq: number;
  durationMs: number;
  sampleEvery: number;
  totalFrames: number;
};

/**
 * Loop timing for the bounce. A known tempo gets a loop of a whole number of
 * beats close to the default length, so the beat never drifts across the seam
 * and each beat lasts exactly `60 / bpm` seconds. It samples every frame so the
 * shorter beat pulses of fast tracks are not skipped.
 */
export function waveformBounceLoop(
  bpm?: number,
  tweak: WaveformBounceTweak = 'upbeat-tempo',
): WaveformBounceLoop {
  if (bpm === undefined || !Number.isFinite(bpm) || bpm <= 0) {
    return {
      beatFreq: tweak === 'upbeat-tempo' ? WAVEFORM_BOUNCE_BEAT_FREQ : 0.6,
      durationMs: WAVEFORM_BOUNCE_DURATION_MS,
      sampleEvery: 2,
      totalFrames: WAVEFORM_BOUNCE_TOTAL_FRAMES,
    };
  }
  const beatMs = 60_000 / bpm;
  const beats = Math.max(1, Math.round(WAVEFORM_BOUNCE_DURATION_MS / beatMs));
  const durationMs = beats * beatMs;
  const totalFrames = Math.round((durationMs * 60) / 1000);
  return {
    beatFreq: (2 * Math.PI * beats) / (totalFrames * SIM_TIME_PER_FRAME),
    durationMs,
    sampleEvery: 1,
    totalFrames,
  };
}

export function buildPreRedesignBounceKeyframes(
  intensity = 1,
  rand: () => number = Math.random,
  tweak: WaveformBounceTweak = 'upbeat-tempo',
  bpm?: number,
): Array<Keyframe> {
  const scale = intensity;
  const { beatFreq, sampleEvery, totalFrames } = waveformBounceLoop(bpm, tweak);
  const breath1Freq = tweak === 'upbeat-tempo' ? 0.52 : 0.35;
  const breath2Freq = tweak === 'upbeat-tempo' ? 0.41 : 0.27;
  const usePureBreath = tweak === 'pure-breath';

  let time = 0;
  let jitterRaw = 0;
  let jitterSmooth = 0;
  let rotImpulse = 0;
  let rotation = 0;
  let nudgedThisBeat = false;

  const states: Array<{ finalScale: number; rotDeg: number; step: number; yOffset: number }> = [];

  for (let f = 0; f <= totalFrames; f++) {
    // Primary: clear beat pulse (snappy bump on each "downbeat") – exaggerated up
    const beatPhase = Math.sin(time * beatFreq);
    const beat = beatPhase > 0.88 ? 0.026 * ((beatPhase - 0.88) * 8.3) ** 1.3 * scale : 0;

    // Sub-beats: layered breath (different frequencies so no fixed 2-beat cycle) + smoothed drift
    const breath1 = Math.sin(time * breath1Freq + 0.5) * 0.005 * scale;
    const breath2 = Math.sin(time * breath2Freq + 1.1) * 0.004 * scale;
    let microDrift: number;
    if (usePureBreath) {
      microDrift = Math.sin(time * 0.19 + 2.3) * 0.0028 * scale;
    } else {
      jitterRaw = jitterRaw * 0.86 + (rand() - 0.5) * 0.0018 * scale;
      jitterSmooth += (jitterRaw - jitterSmooth) * 0.24;
      microDrift = jitterSmooth;
    }
    const variation = breath1 + breath2 + microDrift;

    const scaleDelta = (beat + variation) * 0.95;
    // Vertical bounce: lift on beat + breath wobble, in px (negative = up)
    const yOffset = (beat * 0.8 + variation * 1.3) * -14;

    if (beatPhase > 0.88) {
      if (!nudgedThisBeat) {
        nudgedThisBeat = true;
        const nudgeMag = 0.4 + rand() * 1.5;
        rotImpulse += (rand() - 0.5) * 2 * nudgeMag * 0.65;
      }
    } else if (beatPhase < 0.5) {
      nudgedThisBeat = false;
    }
    // Smooth 5-frame attack into rotImpulse + exponential decay so the 300px
    // sleeve corners never teleport in a single 16.7ms frame.
    rotImpulse *= 0.92;
    rotation = (rotation + (rotImpulse - rotation) * 0.26) * (0.965 + rand() * 0.015);
    time += SIM_TIME_PER_FRAME;

    if (f % sampleEvery === 0 || f === totalFrames) {
      states.push({
        finalScale: 1 + scaleDelta,
        rotDeg: rotation,
        step: f,
        yOffset,
      });
    }
  }

  const first = states[0];
  return states.map((s, idx) => {
    const isLast = idx === states.length - 1 && first !== undefined;
    const sc = (isLast ? first.finalScale : s.finalScale).toFixed(4);
    const rot = (isLast ? first.rotDeg : s.rotDeg).toFixed(2);
    const y = (isLast ? first.yOffset : s.yOffset).toFixed(2);
    return {
      offset: Number((s.step / totalFrames).toFixed(5)),
      transform: `rotate(${rot}deg) scale3d(${sc}, ${sc}, 1) translate3d(0, ${y}px, 0)`,
    };
  });
}

/**
 * Hook that applies the pre-redesign (`e5174284`) beat-led waveform bounce
 * (Tweak C: `beatFreq = 0.95`, ~91 BPM, or the track's own tempo when `bpm` is
 * known) to a ref when music is playing, running on the browser's Web
 * Animations compositor thread so Firefox WebRender and Chrome Blink stay
 * locked at 60fps without main-thread style invalidation.
 */
export function useWaveformBounce<T extends HTMLElement>({
  isPlaying,
  intensity = 1,
  tweak = 'upbeat-tempo',
  bpm,
}: WaveformBounceOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (!isPlaying || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      delete element.dataset.playing;
      element.style.transform = '';
      return;
    }

    element.dataset.playing = 'true';
    if (typeof element.animate !== 'function') {
      return () => {
        delete element.dataset.playing;
      };
    }

    const animation = element.animate(
      buildPreRedesignBounceKeyframes(intensity, Math.random, tweak, bpm),
      {
        duration: waveformBounceLoop(bpm, tweak).durationMs,
        easing: 'linear',
        iterations: Number.POSITIVE_INFINITY,
      },
    );

    return () => {
      animation.cancel();
      delete element.dataset.playing;
      element.style.transform = '';
    };
  }, [isPlaying, intensity, tweak, bpm]);

  return ref;
}
