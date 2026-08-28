import type { ReactNode } from 'react';
import ClassicAlbumsLayout, {
  metadata as albumsMetadata,
} from '../../../../(classic)/music/albums/layout';

export const metadata = albumsMetadata;

export default function Layout({ children }: { children: ReactNode }) {
  return <ClassicAlbumsLayout>{children}</ClassicAlbumsLayout>;
}
