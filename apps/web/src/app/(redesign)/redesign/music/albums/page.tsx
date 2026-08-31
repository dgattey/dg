import ClassicAlbumPage from '../../../../(classic)/music/albums/page';

export default function Page(props: {
  searchParams: Promise<Record<string, string | Array<string> | undefined>>;
}) {
  return <ClassicAlbumPage {...props} />;
}
