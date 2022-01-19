import type { MyLocationQuery } from 'api/contentful/generated/fetchMyLocation.generated';
import useColorScheme from 'hooks/useColorScheme';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapGL, MapRef, ViewState } from 'react-map-gl';
import styled from 'styled-components';

/**
 * Represents a location along with some metadata
 */
export type MapLocation = Pick<
  NonNullable<MyLocationQuery['contentTypeLocation']>,
  'point' | 'initialZoom' | 'image'
> & {
  /**
   * Converts zoom levels to a number array
   */
  zoomLevels: Array<number>;
};

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

const LIGHT_STYLE = 'mapbox://styles/dylangattey/ckyfpsonl01w014q8go5wvnh2';
const DARK_STYLE = 'mapbox://styles/dylangattey/ckylbbyzc0ok916jx0bvos03d';

// This wrapper ensures mapbox css is taken care of
const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  & .mapboxgl-ctrl {
    margin: 2rem;
  }
`;

/**
 * Uses Mapbox to show a canvas-based map of my current location.
 */
const Map = ({ location, viewState: outsideViewState, children }: Props) => {
  const mapRef = useRef<MapRef>(null);
  const { colorScheme } = useColorScheme();
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
    latitude: location?.point?.lat ?? 0,
    longitude: location?.point?.lon ?? 0,
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
        logoPosition="bottom-right"
        interactive
        pitchWithRotate={false}
        touchPitch={false}
        onZoom={(event) => setViewState({ ...event.viewState, ...size })}
        onDrag={(event) => setViewState({ ...event.viewState, ...size })}
        onRotate={(event) => setViewState({ ...event.viewState, ...size })}
        mapStyle={colorScheme === 'dark' ? DARK_STYLE : LIGHT_STYLE}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {children}
      </MapGL>
    </Wrapper>
  );
};

export default Map;
