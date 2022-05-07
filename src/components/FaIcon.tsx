import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  icon: IconDefinition;
}

/**
 * Creates a standard-sized font awesome icon
 */
const FaIcon = ({ icon }: Props) => <FontAwesomeIcon width="1em" height="1em" icon={icon} />;

export default FaIcon;
