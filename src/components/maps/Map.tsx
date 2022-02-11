import type { MapLocation } from 'api/types/MapLocation';
import ColorSchemeContext from 'components/ColorSchemeContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AttributionControl, Map as MapGL, MapRef, ViewState } from 'react-map-gl';
import styled from 'styled-components';
import StandardControls from './StandardControls';

interface Size {
  /**
   * Full width of the component this map sits in, if known
   */
  width: number;

  /**
   * Full height of the component this map sits in, if known
   */
  height: number;
}

// The actual state for the map
type MapViewState = ViewState & Size;

export type Props = {
  /**
   * Where we're centered and zoomed
   */
  location: MapLocation | null;

  /**
   * Provides state for the map
   */
  viewState: Pick<MapViewState, 'width' | 'height'> & Partial<Pick<MapViewState, 'padding'>>;

  /**
   * If children exist, they need to be real elements.
   * Use this to pass layers and features.
   */
  children?: React.ReactElement | Array<React.ReactElement> | null;
};

const LIGHT_STYLE = 'mapbox://styles/dylangattey/ckyfpsonl01w014q8go5wvnh2?optimize=true';
const DARK_STYLE = 'mapbox://styles/dylangattey/ckylbbyzc0ok916jx0bvos03d?optimize=true';

// This wrapper ensures we pad ctrls and re-override Pico's button defaults
const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  & .mapboxgl-ctrl {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 1.25rem;
  }
`;

/**
 * Uses Mapbox to show a canvas-based map of my current location.
 */
const Map = ({ location, viewState: outsideViewState, children }: Props) => {
  const mapRef = useRef<MapRef>(null);
  const { colorScheme } = useContext(ColorSchemeContext);
  const size = useMemo(
    () => ({
      width: outsideViewState.width,
      height: outsideViewState.height,
    }),
    [outsideViewState.height, outsideViewState.width],
  );

  // This will be used to set zoom levels, eventually
  const [viewState, setViewState] = useState<MapViewState>({
    ...size,
    latitude: location?.point?.latitude ?? 0,
    longitude: location?.point?.longitude ?? 0,
    zoom: location?.initialZoom ?? 0,
    padding: outsideViewState.padding ?? { left: 0, right: 0, top: 0, bottom: 0 },
    bearing: 0,
    pitch: 0,
  });
  const zoomLevels = location?.zoomLevels ?? [];
  const minZoom = zoomLevels[0];
  const maxZoom = zoomLevels[zoomLevels.length - 1];

  // Updates the view state when a parent changes it
  useEffect(() => {
    setViewState((currentState) => ({ ...currentState, ...outsideViewState }));
  }, [outsideViewState]);

  return (
    <Wrapper>
      <MapGL
        ref={mapRef}
        viewState={viewState}
        minZoom={minZoom}
        maxZoom={maxZoom}
        attributionControl={false}
        logoPosition="bottom-left"
        interactive
        pitchWithRotate={false}
        touchPitch={false}
        onMove={(event) => setViewState({ ...event.viewState, ...size })}
        mapStyle={colorScheme === 'dark' ? DARK_STYLE : LIGHT_STYLE}
        styleDiffing={false}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        <AttributionControl position="bottom-right" />
        <StandardControls mapRef={mapRef} />
        {children}
      </MapGL>
    </Wrapper>
  );
};

export default Map;
