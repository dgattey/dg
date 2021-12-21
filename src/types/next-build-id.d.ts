interface Options {
  dir?: string;
  describe?: boolean;
}

declare module 'next-build-id' {
  function async(options: Options): Promise<string | null>;
  export function sync(options: Options): string | null;
  export default async;
}
