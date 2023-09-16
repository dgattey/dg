/* eslint-disable no-underscore-dangle */
import type { Map } from 'mapbox-gl';
import { useEffect, useMemo, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useControl } from 'react-map-gl';
import { useTheme } from '@mui/material';
import { ControlContainer, ControlContainerProps } from './ControlContainer';

type ControlProps = ControlContainerProps & {
  /**
   * Which corner of the map the control appears within. Thanks to quirks of
   * the sizing of the map, no controls but `top-left` appear when the map is
   * collapsed.
   */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

const CLASSNAME = 'mapboxgl-ctrl';

/**
 * This class wraps `ControlContainer` to add/remove elements from
 * the map when the library decides.
 */
class DGControl {
  /**
   * What Mapbox uses for the map itself - needs to be named this
   */
  _map: Map | undefined;

  /**
   * What Mapbox uses for the container for the element we're adding -
   * needs to be named this
   */
  _container: HTMLElement | undefined;

  /**
   * Current root, wrapping _container
   */
  #root: Root | null;

  /**
   * The container's props - private
   */
  #containerProps: ControlContainerProps;

  /**
   * Saves the props for later
   */
  constructor(props: ControlContainerProps) {
    this.#containerProps = props;
    this.#root = null;
  }

  /**
   * Creates a new div that holds a `ControlContainer` for the contents. Pass
   * onClick if there are not multiple children.
   */
  onAdd(map: Map) {
    this._map = map;
    this._container?.parentNode?.removeChild(this._container);
    this._container = document.createElement('div');
    this.#root = createRoot(this._container);
    this.onPropsUpdate(this.#containerProps);
    return this._container;
  }

  /**
   * Renders the control container when the props change
   */
  onPropsUpdate(newProps: ControlContainerProps) {
    this.#containerProps = newProps;
    if (!this._container || !this.#root) {
      return;
    }
    const { onClick, children, className, ...props } = newProps;
    this._container.className = className ?? CLASSNAME;
    const controlContainer = Array.isArray(children) ? (
      <ControlContainer {...props}>{children}</ControlContainer>
    ) : (
      <ControlContainer onClick={onClick} {...props}>
        {children}
      </ControlContainer>
    );

    this.#root.render(controlContainer);
    if (Array.isArray(children)) {
      this._container.onclick = onClick ?? null;
    }
  }

  /**
   * Remove the container and reset map, but save props for later
   */
  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._container = undefined;
    this.#root = null;
    this._map = undefined;
  }
}

/**
 * Returns a no-op component that adds a control to the map in a given
 * position of the map (corners).
 */
export function Control({ position, ...props }: ControlProps) {
  const theme = useTheme(); // as much of this is class based, we need to grab the theme this way
  const control = useRef<DGControl | null>(null);
  const properProps = useMemo(
    () => ({
      ...props,
      theme,
      className: props.className ? `${props.className} ${CLASSNAME}` : CLASSNAME,
    }),
    [props, theme],
  );

  // Make sure to update the children/etc when they change
  useEffect(() => control.current?.onPropsUpdate(properProps), [properProps]);

  useControl(
    () => {
      const newControl = new DGControl(properProps);
      control.current = newControl;
      return newControl;
    },
    {
      position,
    },
  );
  return null;
}
