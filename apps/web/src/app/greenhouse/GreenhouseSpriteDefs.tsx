/** biome-ignore-all lint/correctness/useUniqueElementIds: symbol ids are the <use href> contract */

export function GreenhouseSpriteDefs() {
  return (
    <defs>
      <symbol id="leaf-zz" viewBox="0 0 32 48">
        <ellipse cx="16" cy="26" fill="var(--leaf-dark)" rx="11" ry="18" />
        <ellipse cx="14" cy="22" fill="var(--leaf-mid)" rx="7" ry="13" />
        <ellipse cx="13" cy="18" fill="var(--leaf-wash)" opacity="0.45" rx="4" ry="8" />
        <rect fill="var(--leaf-dark)" height="8" rx="1" width="2.2" x="15" y="40" />
      </symbol>
      <symbol id="leaf-pothos" viewBox="0 0 32 40">
        <path
          d="M16 4c6 2 14 10 14 18 0 8-6 16-14 16S2 30 2 22C2 14 10 6 16 4Z"
          fill="var(--leaf-mid)"
        />
        <path
          d="M16 8c4 2 9 8 9 14 0 2-1 4-2 6-4-1-7-5-8-10-1 5-3 8-7 10-1-2-2-4-2-6 0-6 5-12 10-14Z"
          fill="var(--leaf-variegation)"
        />
        <rect fill="var(--leaf-dark)" height="6" rx="1" width="2" x="15" y="34" />
      </symbol>
      <symbol id="leaf-calathea" viewBox="0 0 24 48">
        <ellipse cx="12" cy="24" fill="var(--leaf-dark)" rx="8" ry="20" />
        <path
          d="M12 6v36M8 12c2 4 2 8 0 12 2 4 2 8 0 12M16 12c-2 4-2 8 0 12-2 4-2 8 0 12"
          fill="none"
          stroke="var(--leaf-wash)"
          strokeWidth="1.2"
        />
        <rect fill="var(--leaf-dark)" height="6" rx="1" width="2" x="11" y="42" />
      </symbol>
      <symbol id="leaf-prayer" viewBox="0 0 32 40">
        <ellipse cx="16" cy="20" fill="var(--leaf-mid)" rx="12" ry="16" />
        <path
          d="M16 6v28M8 12l8 4 8-4M8 20l8 4 8-4M8 28l8 4 8-4"
          fill="none"
          stroke="var(--leaf-dark)"
          strokeWidth="1.1"
        />
        <rect fill="var(--leaf-dark)" height="5" rx="1" width="2" x="15" y="35" />
      </symbol>
      <symbol id="leaf-nerve" viewBox="0 0 20 28">
        <ellipse cx="10" cy="14" fill="var(--leaf-wash)" rx="7" ry="11" />
        <path
          d="M10 4v20M6 8c2 3 2 6 0 9M14 8c-2 3-2 6 0 9"
          fill="none"
          stroke="var(--vein-pink)"
          strokeWidth="1.15"
        />
      </symbol>
      <symbol id="leaf-bop" viewBox="0 0 36 56">
        <ellipse cx="14" cy="30" fill="var(--leaf-dark)" rx="10" ry="22" />
        <ellipse cx="12" cy="26" fill="var(--leaf-mid)" rx="6" ry="14" />
        <path d="M22 10c6 2 10 8 8 14-6 2-12-2-14-8 2-4 4-6 6-6Z" fill="var(--bop-orange)" />
        <path d="M24 12c4 1 6 5 5 9-4 1-8-1-9-5 1-3 2-4 4-4Z" fill="var(--bop-blue)" />
        <rect fill="var(--leaf-dark)" height="8" rx="1" width="2.2" x="13" y="48" />
      </symbol>
      <symbol id="leaf-monstera" viewBox="0 0 40 48">
        <path
          d="M20 4c10 2 18 12 18 22 0 12-8 20-18 20S2 38 2 26C2 16 10 6 20 4Z M12 16c2-1 4 0 4 3 0 3-2 4-4 3-2-1-2-4 0-6Z M24 16c2-1 4 0 4 3 0 3-2 4-4 3-2-1-2-4 0-6Z M10 26c3-1 5 1 5 4s-3 4-5 3c-3-1-3-5 0-7Z M26 26c3-1 5 1 5 4s-3 4-5 3c-3-1-3-5 0-7Z M18 30c2 0 3 2 2 4s-4 2-4 0 0-4 2-4Z"
          fill="var(--leaf-dark)"
          fillRule="evenodd"
        />
        <ellipse cx="16" cy="18" fill="var(--leaf-wash)" opacity="0.35" rx="5" ry="7" />
        <rect fill="var(--leaf-dark)" height="6" rx="1" width="2.4" x="19" y="42" />
      </symbol>
    </defs>
  );
}
