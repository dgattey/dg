import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box } from '@dg/ui/core/Box';
import { GlassContainer } from '@dg/ui/core/GlassContainer';
import type { SxObject } from '@dg/ui/theme';
import { Minus, Plus } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  surface?: SiteSurface;
};

const containerSx: SxObject = {
  borderRadius: '24px',
  display: 'flex',
  left: 26,
  overflow: 'hidden',
  position: 'absolute',
  top: 26,
  zIndex: 1,
};

const dividerStyle: CSSProperties = {
  backgroundColor: 'var(--mui-palette-divider)',
  width: '1px',
};

const collageContainerStyle: CSSProperties = {
  display: 'grid',
  gap: '5px',
  position: 'absolute',
  right: 12,
  top: 12,
  zIndex: 2,
};

const ZOOM_CONTROLS_CSS = `
.dg-zoom-btn-classic {
  align-items: center;
  background: none;
  border: none;
  color: var(--mui-palette-text-primary);
  cursor: pointer;
  display: flex;
  font-size: 1rem;
  justify-content: center;
  line-height: 1;
  padding: 0.4rem 0.5rem;
  transition: background-color 0.2s;
}
.dg-zoom-btn-classic:hover {
  background-color: var(--mui-palette-action-hover);
}
.dg-zoom-btn-collage {
  align-items: center;
  background-color: var(--cream);
  border: 0;
  clip-path: var(--quad-b);
  color: var(--ink-on-cream);
  cursor: pointer;
  display: flex;
  font-size: 17px;
  font-weight: 800;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 28px;
}
.dg-zoom-btn-collage:hover {
  background-color: color-mix(in srgb, var(--cream) 86%, var(--ochre));
}
.dg-zoom-btn-collage:focus-visible {
  border-radius: 9px 13px 10px 12px;
  outline: 2px solid currentColor;
  outline-offset: -3px;
}
`;

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};

/**
 * Glass morphism zoom controls overlay, positioned in the top-left corner.
 */
export function ZoomControls({ onZoomIn, onZoomOut, surface = 'classic' }: ZoomControlsProps) {
  if (surface === 'collage') {
    return (
      <Box onMouseDown={stopPropagation} onMouseUp={stopPropagation} style={collageContainerStyle}>
        <style>{ZOOM_CONTROLS_CSS}</style>
        <button
          aria-label="Zoom in"
          className="dg-zoom-btn-collage"
          onClick={onZoomIn}
          type="button"
        >
          <Plus aria-hidden="true" size="1em" />
        </button>
        <button
          aria-label="Zoom out"
          className="dg-zoom-btn-collage"
          onClick={onZoomOut}
          type="button"
        >
          <Minus aria-hidden="true" size="1em" />
        </button>
      </Box>
    );
  }

  return (
    <GlassContainer onMouseDown={stopPropagation} onMouseUp={stopPropagation} sx={containerSx}>
      <style>{ZOOM_CONTROLS_CSS}</style>
      <button aria-label="Zoom in" className="dg-zoom-btn-classic" onClick={onZoomIn} type="button">
        <Plus size="1em" />
      </button>
      <div style={dividerStyle} />
      <button
        aria-label="Zoom out"
        className="dg-zoom-btn-classic"
        onClick={onZoomOut}
        type="button"
      >
        <Minus size="1em" />
      </button>
    </GlassContainer>
  );
}
