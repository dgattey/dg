'use client';

import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { type ReactNode, useEffect, useRef } from 'react';
import { CHARACTER_ROLE, ForestCharacter } from './ForestCharacter';
import { LANDMARK_ATTRIBUTE, LANDMARK_NEAR_ATTRIBUTE } from './ForestLandmark';
import { layerZ, MINIMAP_MARKER_ROLE, TILE_SIZE } from './forestMap';
import { hudSurfaceSx } from './forestMaterials';
import { FOREST_COLOR_VARS } from './forestPalette';

/** Client walker. Terrain and cards arrive as server-rendered children. */

const WALK_SPEED_PX_PER_SECOND = 340;
const CAMERA_EASING = 0.16;
const NEAR_DISTANCE_PX = TILE_SIZE * 3.2;
const FOOT_HALF_WIDTH = 9;
const FOOT_HALF_HEIGHT = 6;
/** Forgiveness when clipping a tree corner, so gaps in the woods stay passable. */
const CORNER_SLIP_PX = 9;
const MAX_FRAME_SECONDS = 1 / 20;

const MOVEMENT_KEYS: Record<string, { x: number; y: number }> = {
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  s: { x: 0, y: 1 },
  w: { x: 0, y: -1 },
};

const ACTIVATION_KEYS = new Set([' ', 'Enter']);

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), Math.max(low, high));

const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

const sceneShellSx: SxObject = {
  ...FOREST_COLOR_VARS,
  backgroundColor: 'var(--forest-ocean)',
  height: '100dvh',
  minHeight: '30rem',
  position: 'relative',
};

const viewportSx: SxObject = {
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: -2,
  },
  height: '100%',
  overflow: 'auto',
  overscrollBehavior: 'contain',
  position: 'relative',
  scrollbarColor: 'var(--forest-wood-dark) transparent',
  scrollbarWidth: 'thin',
};

const WAVE_PERIOD_MS = 5200;
const WIND_PERIOD_MS = 3800;

const worldSx: SxObject = {
  '@keyframes forestFly': {
    '0%': { transform: 'translate3d(0, 0, 0)' },
    '50%': { transform: 'translate3d(140px, -16px, 0)' },
    '100%': { transform: 'translate3d(260px, 4px, 0)' },
  },
  '@keyframes forestHop': {
    '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
    '50%': { transform: 'translate3d(10px, 0, 0)' },
  },
  '@keyframes forestRipple': {
    '0%, 100%': { backgroundSize: '18% 18%', opacity: 0.18 },
    '50%': { backgroundSize: '22% 22%', opacity: 0.4 },
  },
  '@keyframes forestWave': {
    '0%, 100%': { backgroundPosition: '0% 0', opacity: 0.28 },
    '50%': { backgroundPosition: '70% 0', opacity: 0.62 },
  },
  '@keyframes forestWind': {
    from: { transform: 'rotate(-0.7deg)' },
    to: { transform: 'rotate(0.9deg)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .forest-wave, & .forest-ripple, & .forest-wind, & .forest-critter': {
      animation: 'none',
    },
  },
  '& .forest-critter-bird': {
    animation: 'forestFly 14000ms linear infinite',
  },
  '& .forest-critter-rabbit': {
    animation: 'forestHop 4200ms ease-in-out infinite',
  },
  '& .forest-ripple': {
    animation: `forestRipple ${WAVE_PERIOD_MS * 1.35}ms ease-in-out infinite`,
  },
  '& .forest-wave': {
    animation: `forestWave ${WAVE_PERIOD_MS}ms ease-in-out infinite`,
  },
  '& .forest-wind': {
    animation: `forestWind ${WIND_PERIOD_MS}ms ease-in-out infinite alternate`,
    transformOrigin: '50% 100%',
  },
  left: 0,
  position: 'absolute',
  top: 0,
};

const characterAnchorSx: SxObject = {
  [`&[data-facing='left'] [data-role='${CHARACTER_ROLE}']`]: { scale: '-1 1' },
  [`&[data-walking='true'] [data-role='${CHARACTER_ROLE}']`]: {
    animation: 'forestStep 320ms ease-in-out infinite alternate',
  },
  '@keyframes forestStep': {
    from: { translate: '0 0' },
    to: { translate: '1px 0' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    [`&[data-walking='true'] [data-role='${CHARACTER_ROLE}']`]: { animation: 'none' },
  },
  height: 0,
  left: 0,
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width: 0,
  willChange: 'transform',
};

const hintSx: SxObject = {
  ...hudSurfaceSx,
  '@media (max-height: 650px)': { display: 'none' },
  '@media (pointer: coarse)': { display: 'none' },
  borderRadius: '10px',
  bottom: 16,
  color: 'var(--mui-palette-text-primary)',
  left: 16,
  maxWidth: 'min(42vw, calc(100% - 8rem))',
  paddingBlock: 0.5,
  paddingInline: 2,
  pointerEvents: 'none',
  position: 'fixed',
  zIndex: 6,
};

type ForestSceneProps = {
  blockedMask: ReadonlyArray<string>;
  children: ReactNode;
  columns: number;
  /** Chrome pinned to the viewport rather than the world, e.g. the minimap. */
  overlay?: ReactNode;
  rows: number;
  spawn: { tileX: number; tileY: number };
};

export function ForestScene({
  blockedMask,
  children,
  columns,
  overlay,
  rows,
  spawn,
}: ForestSceneProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  const worldWidth = columns * TILE_SIZE;
  const worldHeight = rows * TILE_SIZE;
  const spawnX = spawn.tileX * TILE_SIZE + TILE_SIZE / 2;
  const spawnY = spawn.tileY * TILE_SIZE + TILE_SIZE / 2;

  const positionRef = useRef({ x: spawnX, y: spawnY });

  useEffect(() => {
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    const world = worldRef.current;
    const character = characterRef.current;
    if (!shell || !viewport || !world || !character) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const landmarks = Array.from(
      world.querySelectorAll<HTMLElement>(`[${LANDMARK_ATTRIBUTE}]`),
    ).map((element) => ({ element, x: element.offsetLeft, y: element.offsetTop }));

    const minimapMarker = shell.querySelector<HTMLElement>(`[data-role='${MINIMAP_MARKER_ROLE}']`);

    const held = new Set<string>();
    let footX = positionRef.current.x;
    let footY = positionRef.current.y;
    let cameraX = 0;
    let cameraY = 0;
    let nearest: HTMLElement | null = null;
    let isOnScreen = true;
    let lastFrame = 0;
    let frame = 0;
    let isWalkerDriving = false;

    const canStand = (x: number, y: number) => {
      const corners = [
        [x - FOOT_HALF_WIDTH, y - FOOT_HALF_HEIGHT],
        [x + FOOT_HALF_WIDTH, y - FOOT_HALF_HEIGHT],
        [x - FOOT_HALF_WIDTH, y + FOOT_HALF_HEIGHT],
        [x + FOOT_HALF_WIDTH, y + FOOT_HALF_HEIGHT],
      ];
      return corners.every(([cornerX, cornerY]) => {
        if (cornerX === undefined || cornerY === undefined) {
          return false;
        }
        const row = blockedMask[Math.floor(cornerY / TILE_SIZE)];
        return row?.[Math.floor(cornerX / TILE_SIZE)] === '0';
      });
    };

    const slipFor = (x: number, y: number, isVertical: boolean) => {
      if (canStand(x, y)) {
        return 0;
      }
      for (const slip of [CORNER_SLIP_PX, -CORNER_SLIP_PX]) {
        if (canStand(isVertical ? x + slip : x, isVertical ? y : y + slip)) {
          return slip / 3;
        }
      }
      return null;
    };

    const cameraTargetX = () => {
      const visible = viewport.clientWidth;
      return worldWidth <= visible
        ? (visible - worldWidth) / 2
        : clamp(visible / 2 - footX, visible - worldWidth, 0);
    };

    const cameraTargetY = () => {
      const visible = viewport.clientHeight;
      const anchorLine = visible < 650 ? visible * 0.72 : visible * 0.68;
      return worldHeight <= visible
        ? (visible - worldHeight) / 2
        : clamp(anchorLine - footY, visible - worldHeight, 0);
    };

    const updateNearest = () => {
      let best: HTMLElement | null = null;
      let bestDistance = NEAR_DISTANCE_PX;
      for (const landmark of landmarks) {
        const distance = Math.hypot(landmark.x - footX, landmark.y - footY);
        if (distance < bestDistance) {
          best = landmark.element;
          bestDistance = distance;
        }
      }
      if (best === nearest) {
        return;
      }
      nearest?.removeAttribute(LANDMARK_NEAR_ATTRIBUTE);
      best?.setAttribute(LANDMARK_NEAR_ATTRIBUTE, 'true');
      nearest = best;
    };

    const drawCharacter = () => {
      positionRef.current = { x: footX, y: footY };
      character.style.transform = `translate3d(${footX}px, ${footY}px, 0)`;
      character.style.zIndex = String(layerZ(Math.floor(footY / TILE_SIZE)));
      minimapMarker?.style.setProperty(
        'transform',
        `translate3d(${(footX / worldWidth) * 100}%, ${(footY / worldHeight) * 100}%, 0)`,
      );
      updateNearest();
    };

    const moveTo = (x: number, y: number) => {
      footX = x;
      footY = y;
      cameraX = cameraTargetX();
      cameraY = cameraTargetY();
      world.style.transform = `translate(${cameraX}px, ${cameraY}px)`;
      drawCharacter();
    };

    const step = (time: number) => {
      frame = requestAnimationFrame(step);
      const elapsed = Math.min((time - lastFrame) / 1000, MAX_FRAME_SECONDS);
      lastFrame = time;

      let directionX = 0;
      let directionY = 0;
      for (const key of held) {
        const vector = MOVEMENT_KEYS[key];
        if (vector) {
          directionX += vector.x;
          directionY += vector.y;
        }
      }

      const isWalking = directionX !== 0 || directionY !== 0;
      if (isWalking) {
        const length = Math.hypot(directionX, directionY) || 1;
        const distance = WALK_SPEED_PX_PER_SECOND * elapsed;
        const stepX = (directionX / length) * distance;
        const stepY = (directionY / length) * distance;
        if (stepX !== 0) {
          const slip = slipFor(footX + stepX, footY, false);
          if (slip !== null) {
            footX += stepX;
            footY += slip;
          }
        }
        if (stepY !== 0) {
          const slip = slipFor(footX, footY + stepY, true);
          if (slip !== null) {
            footY += stepY;
            footX += slip;
          }
        }
        if (directionX !== 0) {
          character.dataset.facing = directionX < 0 ? 'left' : 'right';
        }
        drawCharacter();
      }
      character.dataset.walking = String(isWalking);

      const targetX = cameraTargetX();
      const targetY = cameraTargetY();
      const easing = prefersReducedMotion ? 1 : CAMERA_EASING;
      cameraX += (targetX - cameraX) * easing;
      cameraY += (targetY - cameraY) * easing;
      world.style.transform = `translate(${Math.round(cameraX)}px, ${Math.round(cameraY)}px)`;
    };

    const ownsKeyboard = () => {
      if (!isOnScreen) {
        return false;
      }
      const active = document.activeElement;
      return !active || active === document.body || viewport.contains(active);
    };

    const focusIsOnCardContent = () => {
      const active = document.activeElement;
      return active !== null && active !== viewport && viewport.contains(active);
    };

    const takeTheWheel = () => {
      if (isWalkerDriving) {
        return;
      }
      isWalkerDriving = true;
      viewport.style.overflow = 'hidden';
      viewport.scrollTo(0, 0);
      moveTo(footX, footY);
      frame = requestAnimationFrame((time) => {
        lastFrame = time;
        frame = requestAnimationFrame(step);
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || !ownsKeyboard()) {
        return;
      }
      const key = normalizeKey(event.key);
      if (MOVEMENT_KEYS[key]) {
        event.preventDefault();
        takeTheWheel();
        held.add(key);
        return;
      }
      if (ACTIVATION_KEYS.has(event.key) && nearest && !focusIsOnCardContent()) {
        const link = nearest.querySelector<HTMLAnchorElement>('a[href]');
        if (link) {
          event.preventDefault();
          link.click();
        }
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      held.delete(normalizeKey(event.key));
    };

    const onBlur = () => held.clear();

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!isWalkerDriving || !(target instanceof Element)) {
        return;
      }
      const landmark = target.closest<HTMLElement>(`[${LANDMARK_ATTRIBUTE}]`);
      if (landmark) {
        moveTo(landmark.offsetLeft, landmark.offsetTop);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isOnScreen = entry?.isIntersecting ?? true;
      },
      { threshold: 0.15 },
    );
    observer.observe(viewport);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    world.addEventListener('focusin', onFocusIn, true);
    drawCharacter();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      world.removeEventListener('focusin', onFocusIn, true);
      nearest?.removeAttribute(LANDMARK_NEAR_ATTRIBUTE);
    };
  }, [blockedMask, worldWidth, worldHeight]);

  return (
    <Box ref={shellRef} sx={sceneShellSx}>
      <Box
        aria-label="Forest map of this site. The map scrolls, and with scripting on, arrow keys walk a character between cards."
        ref={viewportRef}
        role="application"
        sx={viewportSx}
        tabIndex={0}
      >
        <Box ref={worldRef} sx={{ ...worldSx, height: worldHeight, width: worldWidth }}>
          {children}
          <Box ref={characterRef} sx={characterAnchorSx}>
            <ForestCharacter />
          </Box>
        </Box>
      </Box>
      {overlay}
      <Typography {...jsOnlyProps} component="p" sx={hintSx} variant="caption">
        Scroll to explore · arrow keys or WASD to walk · Enter opens the nearest spot
      </Typography>
    </Box>
  );
}
