/* eslint-disable no-underscore-dangle */
import { Map } from 'mapbox-gl';
import React from 'react';
import ReactDOM from 'react-dom';
import { useControl } from 'react-map-gl';
import ControlContainer, { Props as ContainerProps } from './ControlContainer';

type Props = ContainerProps & {
  /**
   * Which corner of the map the control appears within. Thanks to quirks of
   * the sizing of the map, no controls but `top-left` appear when the map is
   * collapsed.
   */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

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
   * The container's props - private
   */
  #containerProps: ContainerProps;

  /**
   * Saves the props for later
   */
  constructor(props: ContainerProps) {
    this.#containerProps = props;
  }

  /**
   * Creates a new div that holds a `ControlContainer` for the contents. Pass
   * onClick if there are not multiple children.
   */
  onAdd(map: Map) {
    const { onClick, children, className, ...props } = this.#containerProps;
    this._map = map;
    this._container = document.createElement('div');
    this._container.onclick = onClick ?? null;
    if (Array.isArray(children)) {
      ReactDOM.render(<ControlContainer {...props}>{children}</ControlContainer>, this._container);
    } else {
      ReactDOM.render(
        <ControlContainer onClick={onClick} {...props}>
          {children}
        </ControlContainer>,
        this._container,
      );
    }
    this._container.className = `mapboxgl-ctrl ${className ?? ''}`;
    return this._container;
  }

  /**
   * Remove the container and reset map, but save props for later
   */
  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}

/**
 * Returns a no-op component that adds a control to the map in a given
 * position of the map (corners).
 */
const Control = ({ position, ...props }: Props) => {
  useControl(() => new DGControl(props), {
    position,
  });
  return null;
};

export default Control;
