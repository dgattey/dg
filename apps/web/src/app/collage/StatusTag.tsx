import { PaperTag } from './PaperTag';

type StatusTagProps = {
  isConnected: boolean;
};

export function StatusTag({ isConnected }: StatusTagProps) {
  return (
    <PaperTag
      className="collageStatusTag"
      tiltDeg={isConnected ? -2 : 2}
      tone={isConnected ? 'leaf' : 'vermilion'}
    >
      {isConnected ? 'Connected' : 'Not connected'}
    </PaperTag>
  );
}
