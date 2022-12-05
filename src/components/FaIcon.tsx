import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  icon: IconDefinition;
}

/**
 * Creates a standard-sized font awesome icon
 */
export function FaIcon({ icon }: Props) {
  return <FontAwesomeIcon width="1em" height="1em" icon={icon} />;
}
