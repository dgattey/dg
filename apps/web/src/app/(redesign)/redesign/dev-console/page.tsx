import ClassicDevConsole from '../../../(classic)/dev-console/page';

export default function Page(props: Parameters<typeof ClassicDevConsole>[0]) {
  return <ClassicDevConsole {...props} surface="collage" />;
}
