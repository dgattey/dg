import { PaperTag } from './PaperTag';
import styles from './StatusTag.module.css';

type StatusTagProps = {
  isConnected: boolean;
};

export function StatusTag({ isConnected }: StatusTagProps) {
  return (
    <PaperTag
      className={styles.status}
      tiltDeg={isConnected ? -2 : 2}
      tone={isConnected ? 'leaf' : 'vermilion'}
    >
      {isConnected ? 'Connected' : 'Not connected'}
    </PaperTag>
  );
}
