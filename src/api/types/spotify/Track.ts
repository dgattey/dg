/**
 * Used for artists, albums, tracks, etc
 */
interface ReferenceObject {
  external_urls: {
    /**
     * URL accessible by non-API users
     */
    spotify: string;
  };

  /**
   * API URL, not public url
   */
  href: string;

  /**
   * Unique id
   */
  id: string;

  /**
   * Name of the resource, like "Glass Animals"
   */
  name: string;

  /**
   * Resource identifier, more readable than the id
   */
  uri: string;
}

/**
 * One album art image of a given size. For safety, it's also
 * possible for this to be undefined, so check it before using!
 */
type AlbumImage<Size extends number> =
  | {
      height: Size;
      width: Size;
      url: string;
    }
  | undefined;

/**
 * One song/track is this!
 */
export type Track = ReferenceObject & {
  artists: Array<ReferenceObject>;
  album: ReferenceObject & {
    images: [AlbumImage<640>, AlbumImage<300>, AlbumImage<64>];
    release_date: string;
  };
};
