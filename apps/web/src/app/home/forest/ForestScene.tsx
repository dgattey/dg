'use client';

import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { type ReactNode, useEffect, useRef } from 'react';
import { CHARACTER_ROLE, ForestCharacter } from './ForestCharacter';
import { LANDMARK_ATTRIBUTE, LANDMARK_NEAR_ATTRIBUTE } from './ForestLandmark';
import { MINIMAP_MARKER_ROLE } from './ForestMinimap';
import { TILE_SIZE } from './forestMap';
import { hudSurfaceSx } from './forestMaterials';
import { FOREST_COLOR_VARS } from './forestPalette';

/**
 * The only client component on the forest homepage.
 *
 * Everything visible — terrain, scenery, every card — arrives as server-rendered
 * `children`. This adds a keyboard-driven walker on top: it reads a blocked-tile
 * mask, moves a sprite with `transform`, pans the world under the viewport, and
 * flags the nearest landmark. Movement is written straight to the DOM inside a
 * rAF loop, so walking never triggers a React render.
 */

const WALK_SPEED_PX_PER_SECOND = 300;
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

const viewportSx: SxObject = {
  ...FOREST_COLOR_VARS,
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: -2,
  },
  // The world owns the page: it fills the viewport below the header edge to
  // edge, with no card frame around it. The ocean floods to every edge so the
  // island reads as an island, not an image clipped inside a panel.
  backgroundColor: 'var(--forest-ocean)',
  height: 'calc(100dvh - var(--site-header-height, 5rem))',
  minHeight: '30rem',
  // Scrollable until the walker takes over on hydration, so a scriptless visitor
  // can still pan the island and click into every card.
  overflow: 'auto',
  overscrollBehavior: 'contain',
  position: 'relative',
};

const worldSx: SxObject = {
  left: 0,
  position: 'absolute',
  top: 0,
  willChange: 'transform',
};

const characterAnchorSx: SxObject = {
  [`&[data-facing='left'] [data-role='${CHARACTER_ROLE}']`]: { scale: '-1 1' },
  [`&[data-walking='true'] [data-role='${CHARACTER_ROLE}']`]: {
    animation: 'forestStep 320ms ease-in-out infinite alternate',
  },
  '@keyframes forestStep': {
    from: { translate: '0 0' },
    to: { translate: '0 -3px' },
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
  zIndex: 5,
};

const hintSx: SxObject = {
  ...hudSurfaceSx,
  borderRadius: 999,
  bottom: 16,
  color: 'var(--mui-palette-text-secondary)',
  left: '50%',
  paddingBlock: 0.5,
  paddingInline: 2,
  pointerEvents: 'none',
  position: 'absolute',
  transform: 'translateX(-50%)',
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  const worldWidth = columns * TILE_SIZE;
  const worldHeight = rows * TILE_SIZE;
  const spawnX = spawn.tileX * TILE_SIZE + TILE_SIZE / 2;
  const spawnY = spawn.tileY * TILE_SIZE + TILE_SIZE / 2;

  // Survives effect restarts (a background RSC refresh re-creates the props), so
  // a data revalidation never teleports someone back to the landing beach.
  const positionRef = useRef({ x: spawnX, y: spawnY });

  useEffect(() => {
    const viewport = viewportRef.current;
    const world = worldRef.current;
    const character = characterRef.current;
    if (!viewport || !world || !character) {
      return;
    }

    viewport.style.overflow = 'hidden';
    viewport.scrollTo(0, 0);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const landmarks = Array.from(
      world.querySelectorAll<HTMLElement>(`[${LANDMARK_ATTRIBUTE}]`),
    ).map((element) => ({ element, x: element.offsetLeft, y: element.offsetTop }));

    const minimapMarker = viewport.querySelector<SVGRectElement>(
      `[data-role='${MINIMAP_MARKER_ROLE}']`,
    );

    const held = new Set<string>();
    let footX = positionRef.current.x;
    let footY = positionRef.current.y;
    let cameraX = 0;
    let cameraY = 0;
    let nearest: HTMLElement | null = null;
    let isOnScreen = true;
    let lastFrame = 0;
    let frame = 0;

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

    /**
     * How far to nudge sideways to make a blocked step fit, or null if it never
     * fits. Clipping the corner of a tree slides you around it instead of
     * stopping you dead, which is what keeps the woods feeling walkable.
     */
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

    /** Keeps the walker centred, stopping the pan once the island's edge is flush. */
    const cameraTargetX = () => {
      const visible = viewport.clientWidth;
      return worldWidth <= visible
        ? (visible - worldWidth) / 2
        : clamp(visible / 2 - footX, visible - worldWidth, 0);
    };

    // Sits the walker below centre: cards stand north of the trail, so the spare
    // room belongs above them rather than under their feet.
    const cameraTargetY = () => {
      const visible = viewport.clientHeight;
      return worldHeight <= visible
        ? (visible - worldHeight) / 2
        : clamp(visible * 0.68 - footY, visible - worldHeight, 0);
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
      minimapMarker?.setAttribute('x', String(footX / TILE_SIZE - 1.5));
      minimapMarker?.setAttribute('y', String(footY / TILE_SIZE - 1.5));
      updateNearest();
    };

    const moveTo = (x: number, y: number) => {
      footX = x;
      footY = y;
      cameraX = cameraTargetX();
      cameraY = cameraTargetY();
      world.style.transform = `translate3d(${cameraX}px, ${cameraY}px, 0)`;
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
      world.style.transform = `translate3d(${Math.round(cameraX)}px, ${Math.round(cameraY)}px, 0)`;
    };

    /**
     * Arrow keys drive the map while the scene is on screen and focus is either
     * inside it or nowhere in particular, so typing elsewhere on the page and
     * tabbing through chrome still behave normally.
     */
    const ownsKeyboard = () => {
      if (!isOnScreen) {
        return false;
      }
      const active = document.activeElement;
      return !active || active === document.body || viewport.contains(active);
    };

    /** True once focus has landed on something inside a card, where Enter is theirs. */
    const focusIsOnCardContent = () => {
      const active = document.activeElement;
      return active !== null && active !== viewport && viewport.contains(active);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || !ownsKeyboard()) {
        return;
      }
      const key = normalizeKey(event.key);
      if (MOVEMENT_KEYS[key]) {
        event.preventDefault();
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

    /** Tabbing to an off-screen card walks the character over to meet it. */
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
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
    world.addEventListener('focusin', onFocusIn);

    moveTo(footX, footY);
    frame = requestAnimationFrame((time) => {
      lastFrame = time;
      frame = requestAnimationFrame(step);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      world.removeEventListener('focusin', onFocusIn);
      nearest?.removeAttribute(LANDMARK_NEAR_ATTRIBUTE);
    };
  }, [blockedMask, worldWidth, worldHeight]);

  return (
    <Box
      aria-label="Forest map of this site. With scripting on, arrow keys walk a character between cards; otherwise the map scrolls."
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
      {overlay}
      <Typography {...jsOnlyProps} component="p" sx={hintSx} variant="caption">
        Arrow keys or WASD to walk · Enter opens the nearest spot
      </Typography>
    </Box>
  );
}
