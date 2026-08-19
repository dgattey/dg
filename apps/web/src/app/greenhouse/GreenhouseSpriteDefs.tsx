/** biome-ignore-all lint/correctness/useUniqueElementIds: symbol ids are the <use href> contract */

export const LEAF_VIEWBOXES = {
  'leaf-bop': '0 0 140 200',
  'leaf-calathea': '0 0 90 200',
  'leaf-monstera': '0 0 160 180',
  'leaf-nerve': '0 0 70 90',
  'leaf-pothos': '0 0 120 150',
  'leaf-prayer': '0 0 110 140',
  'leaf-zz': '0 0 110 190',
} as const;

export function GreenhouseSpriteDefs() {
  return (
    <defs>
      <symbol id="leaf-zz" viewBox={LEAF_VIEWBOXES['leaf-zz']}>
        <path
          d="M54 178c-1.2-28-2-62 1-96 2-22 8-48 14-70"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeLinecap="round"
          strokeWidth="3.2"
        />
        <path
          d="M55 22c12 4 22 18 20 34-2 16-14 26-26 22-10-4-16-16-14-30 2-12 10-22 20-26Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M57 28c8 3 14 12 13 22s-9 16-17 14c-7-2-11-10-10-18 1-8 7-15 14-18Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M72 48c14 6 24 22 20 40-4 16-18 26-32 20-12-5-18-20-14-34 4-14 14-24 26-26Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M73 56c9 4 16 14 13 26-3 11-12 17-21 13-8-3-12-13-9-22 3-10 10-16 17-17Z"
          fill="var(--leaf-mid)"
        />
        <path d="M68 64c4 8 4 16 0 24" fill="none" stroke="var(--leaf-shine)" strokeWidth="1.2" />
        <path
          d="M38 58c-14 7-24 24-18 42 6 16 22 24 36 16 12-6 16-22 10-36-6-14-16-24-28-22Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M40 66c-9 5-15 16-11 28 4 10 14 16 24 10 8-4 11-14 7-24-4-10-11-16-20-14Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M78 92c12 8 18 26 10 42-8 14-24 18-36 8-10-8-12-24-4-36 8-12 20-18 30-14Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M76 100c8 5 12 17 6 28-6 9-16 12-24 5-7-5-8-16-3-24 5-8 13-12 21-9Z"
          fill="var(--leaf-wash)"
          opacity="0.85"
        />
        <path
          d="M32 108c-12 10-16 28-6 42 10 12 28 12 38 0 8-10 6-26-4-36-10-10-20-12-28-6Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M36 116c-8 7-10 18-4 28 6 8 18 8 25 0 5-7 4-17-3-24-7-7-13-8-18-4Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M60 148c8 4 14 14 12 24-3 8-12 12-20 8"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="2.4"
        />
      </symbol>

      <symbol id="leaf-pothos" viewBox={LEAF_VIEWBOXES['leaf-pothos']}>
        <path
          d="M18 22c22-18 58-18 78 6 16 20 10 52-12 70-14 12-36 14-52 2-18-14-24-42-14-78Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M28 28c16-10 42-10 56 6 12 14 8 38-8 52-12 10-30 10-42 0-14-12-18-36-6-58Z"
          fill="var(--leaf-dark)"
          opacity="0.35"
        />
        <path
          d="M36 26c18-4 40 2 46 18 4 12-4 22-16 20-10-2-14-12-22-10-10 2-16-4-8-28Z"
          fill="var(--leaf-variegation)"
        />
        <path
          d="M24 48c8 2 12 12 6 22-4 6-14 8-20 2 2-10 6-20 14-24Z"
          fill="var(--leaf-variegation)"
          opacity="0.85"
        />
        <path
          d="M70 44c10 8 8 24-2 32-6 4-16 2-18-6 4-12 12-22 20-26Z"
          fill="var(--leaf-variegation)"
          opacity="0.7"
        />
        <path
          d="M48 18c2 22 0 44-10 64"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M48 32c10 8 18 20 22 34M48 40c-8 10-12 22-12 36"
          fill="none"
          opacity="0.55"
          stroke="var(--leaf-shadow)"
          strokeWidth="1.1"
        />
        <path
          d="M8 78c16-8 34-4 44 12 8 12 4 32-10 40-16 8-34 2-42-14-6-14 0-30 8-38Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M16 84c10-4 22 0 28 10 6 8 2 22-8 26-12 6-24 0-28-12-4-10 0-20 8-24Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M22 88c8 2 12 10 4 18"
          fill="none"
          stroke="var(--leaf-variegation)"
          strokeWidth="3.5"
        />
        <path
          d="M82 96c14-6 32 2 38 18 4 14-6 28-20 32-16 4-30-6-34-20-4-14 6-26 16-30Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M88 102c8-2 18 2 20 12 2 8-4 16-12 18-10 2-18-4-20-12-2-8 4-16 12-18Z"
          fill="var(--leaf-wash)"
        />
        <path d="M54 92c2 16 0 28-6 44" fill="none" stroke="var(--leaf-shadow)" strokeWidth="2.6" />
      </symbol>

      <symbol id="leaf-calathea" viewBox={LEAF_VIEWBOXES['leaf-calathea']}>
        <path
          d="M46 8c18 10 32 40 32 84 0 40-12 78-32 96-20-18-32-56-32-96 0-44 14-74 32-84Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M46 16c12 8 22 34 22 76 0 36-8 68-22 84-14-16-22-48-22-84 0-42 10-68 22-76Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M34 28c4 18 4 40 0 62 8-4 14-20 14-40s-6-22-14-22Z"
          fill="var(--leaf-wash)"
          opacity="0.9"
        />
        <path
          d="M58 30c-4 18-4 40 0 62-8-4-14-20-14-40s6-22 14-22Z"
          fill="var(--leaf-wash)"
          opacity="0.9"
        />
        <path
          d="M32 58c4 16 4 34 0 52 7-3 12-16 12-32s-5-20-12-20Z"
          fill="var(--leaf-wash)"
          opacity="0.75"
        />
        <path
          d="M60 60c-4 16-4 34 0 52-7-3-12-16-12-32s5-20 12-20Z"
          fill="var(--leaf-wash)"
          opacity="0.75"
        />
        <path
          d="M34 92c3 14 3 28 0 42 6-2 10-14 10-26s-4-16-10-16Z"
          fill="var(--leaf-wash)"
          opacity="0.65"
        />
        <path
          d="M58 94c-3 14-3 28 0 42-6-2-10-14-10-26s4-16 10-16Z"
          fill="var(--leaf-wash)"
          opacity="0.65"
        />
        <path
          d="M46 10c0 28 0 70 0 168"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="2.2"
        />
        <path d="M46 18c0 40 0 90 0 150" fill="none" stroke="var(--vein-pink)" strokeWidth="1.1" />
        <path d="M42 188c2 6 6 8 8 8" fill="none" stroke="var(--leaf-shadow)" strokeWidth="3" />
      </symbol>

      <symbol id="leaf-prayer" viewBox={LEAF_VIEWBOXES['leaf-prayer']}>
        <path
          d="M56 10c28 8 46 32 46 60 0 30-20 54-46 62-26-8-46-32-46-62 0-28 18-52 46-60Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M56 18c20 6 34 24 34 52 0 26-16 46-34 52-18-6-34-26-34-52 0-28 14-46 34-52Z"
          fill="var(--leaf-dark)"
          opacity="0.28"
        />
        <path
          d="M56 14c1 20 2 48 2 108"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="2.4"
        />
        <path d="M28 40c18 8 36 8 54 0" fill="none" stroke="var(--leaf-shadow)" strokeWidth="1.6" />
        <path
          d="M22 62c22 10 44 10 66 0"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="1.6"
        />
        <path
          d="M26 84c20 10 40 10 58 0"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="1.6"
        />
        <path
          d="M32 104c16 8 32 8 48 0"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="1.5"
        />
        <path d="M30 42l26 12 26-12" fill="none" stroke="var(--leaf-wash)" strokeWidth="2.4" />
        <path d="M24 64l32 14 32-14" fill="none" stroke="var(--leaf-wash)" strokeWidth="2.4" />
        <path d="M28 86l28 12 28-12" fill="none" stroke="var(--leaf-wash)" strokeWidth="2.2" />
        <path d="M34 106l22 10 22-10" fill="none" stroke="var(--leaf-wash)" strokeWidth="2" />
        <path d="M54 124c2 8 4 12 6 14" fill="none" stroke="var(--leaf-shadow)" strokeWidth="3" />
      </symbol>

      <symbol id="leaf-nerve" viewBox={LEAF_VIEWBOXES['leaf-nerve']}>
        <path
          d="M34 6c18 8 28 24 28 40 0 18-12 32-28 38-16-6-28-20-28-38 0-16 10-32 28-40Z"
          fill="var(--leaf-wash)"
        />
        <path
          d="M34 12c12 6 20 18 20 34 0 14-8 26-20 30-12-4-20-16-20-30 0-16 8-28 20-34Z"
          fill="var(--leaf-mid)"
          opacity="0.35"
        />
        <path d="M34 8c0 18 0 42 0 70" fill="none" stroke="var(--vein-pink)" strokeWidth="1.8" />
        <path
          d="M20 22c8 6 16 8 24 4M18 36c10 8 20 8 30 2M20 50c8 6 16 8 24 4M24 64c6 4 12 4 18 0"
          fill="none"
          stroke="var(--vein-pink)"
          strokeLinecap="round"
          strokeWidth="1.35"
        />
        <path
          d="M48 22c-8 6-16 8-24 4M50 36c-10 8-20 8-30 2M48 50c-8 6-16 8-24 4"
          fill="none"
          opacity="0.85"
          stroke="var(--vein-pink)"
          strokeWidth="1.1"
        />
        <path d="M52 48c10 4 18 16 14 28-4 10-16 14-26 8" fill="var(--leaf-wash)" opacity="0.85" />
        <path d="M58 54c6 4 10 12 6 20" fill="none" stroke="var(--vein-pink)" strokeWidth="1" />
      </symbol>

      <symbol id="leaf-bop" viewBox={LEAF_VIEWBOXES['leaf-bop']}>
        <path
          d="M36 18c22 8 40 40 40 86 0 36-12 70-36 84-24-14-36-48-36-84 0-46 18-78 32-86Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M38 28c14 8 28 34 28 76 0 32-10 60-28 72-16-12-26-40-26-72 0-42 12-68 26-76Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M40 36c8 10 14 32 12 60-10-6-18-28-18-52 0-8 2-12 6-8Z"
          fill="var(--leaf-shine)"
          opacity="0.35"
        />
        <path
          d="M42 20c0 40 0 90 0 160"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="2.4"
        />
        <path
          d="M42 48c10 12 16 28 18 48M42 64c-8 12-12 28-12 46"
          fill="none"
          opacity="0.5"
          stroke="var(--leaf-shadow)"
          strokeWidth="1.2"
        />
        <path
          d="M78 22c28 6 48 28 40 52-10 8-28 4-38-10-8-12-10-28-2-42Z"
          fill="var(--bop-orange)"
        />
        <path
          d="M84 28c18 4 30 18 24 34-8 4-20 2-28-8-6-8-6-20-4-26Z"
          fill="var(--bop-orange)"
          opacity="0.85"
        />
        <path d="M92 34c12 8 16 20 8 30-10 2-18-6-22-16-2-8 4-14 14-14Z" fill="var(--bop-blue)" />
        <path
          d="M100 40c6 4 8 12 2 18-6 0-10-6-12-12 0-4 4-8 10-6Z"
          fill="var(--leaf-shine)"
          opacity="0.45"
        />
        <path
          d="M70 48c16 2 22 16 14 28-12 4-24-4-28-16-2-8 4-12 14-12Z"
          fill="var(--bop-orange)"
        />
        <path
          d="M42 182c2 8 6 12 10 14"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="3.2"
        />
      </symbol>

      <symbol id="leaf-monstera" viewBox={LEAF_VIEWBOXES['leaf-monstera']}>
        <path
          d="M78 6c18 4 44 18 62 48 14 24 16 52 8 74-10 28-38 48-70 52-34 4-64-16-76-46-12-28-8-62 10-84 16-20 40-40 66-44Z"
          fill="var(--leaf-dark)"
        />
        <path
          d="M76 18c16 6 36 20 46 44 10 22 10 46 0 64-12 20-36 34-58 36-24 2-48-12-58-34-10-22-6-48 8-66 14-18 34-36 62-44Z"
          fill="var(--leaf-mid)"
          opacity="0.45"
        />
        <path
          d="M52 40c8-6 18-2 16 10-2 10-12 14-20 8-8-6-4-14 4-18Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M104 38c10-4 20 4 14 16-6 10-18 10-24 2-6-8 0-16 10-18Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M40 78c14-6 24 6 16 20-8 12-24 10-30-2-6-12 4-16 14-18Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M112 82c14 0 22 14 12 26-10 10-26 6-30-8-4-14 8-18 18-18Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M72 108c10 2 12 14 4 20-10 6-18-2-16-12 2-8 6-10 12-8Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M58 32c8-10 20-8 18 4-2 8-12 12-20 6-6-4-4-8 2-10Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M98 28c10-8 22-2 18 10-2 8-14 10-22 4-6-6-2-10 4-14Z"
          fill="var(--greenhouse-wash, #90ae7a)"
        />
        <path
          d="M78 14c2 28 2 70 0 150"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="2.8"
        />
        <path
          d="M78 40c18 12 32 28 40 50M78 48c-16 14-30 30-38 52M78 80c14 10 24 24 30 40M78 86c-14 12-24 26-30 42"
          fill="none"
          opacity="0.55"
          stroke="var(--leaf-shadow)"
          strokeWidth="1.4"
        />
        <path d="M22 70c-8 18-4 40 12 52" fill="none" stroke="var(--leaf-dark)" strokeWidth="6" />
        <path
          d="M78 164c2 8 6 12 10 14"
          fill="none"
          stroke="var(--leaf-shadow)"
          strokeWidth="3.4"
        />
      </symbol>
    </defs>
  );
}
