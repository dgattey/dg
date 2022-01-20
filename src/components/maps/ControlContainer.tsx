import styled from 'styled-components';

export interface Props {
  /**
   * Called when the control itself is clicked
   */
  onClick: (() => void) | null;

  /**
   * Children need to be defined
   */
  children: React.ReactElement | Array<React.ReactElement> | string | boolean;
}

/**
 * This is what surrounds any control to contain it, automatically responding
 * to the color scheme.
 */
const ControlContainer = styled.div`
  color: var(--color);
  background-color: var(--background-color);
  padding: 0.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
`;

export default ControlContainer;
