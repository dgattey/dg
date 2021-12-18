import useSWR from 'swr';
import useFetcher from './useFetcher';

const FALLBACK_VERSION = 'v0.0.1';

/**
 * Fetches a version of the site from the Github data. Falls back to
 * 'v0.0.1' if necessary.
 */
const useSiteVersion = () => {
  const { data: version, error } = useSWR<string, Error>('/api/version', useFetcher);
  return {
    version: version ?? FALLBACK_VERSION,
    isLoading: !error && !version,
    error,
  };

  // const allVersions = useStaticQuery<GatsbyTypes.SiteVersionQuery>(graphql`
  //   query SiteVersion {
  //     githubData {
  //       data {
  //         repository {
  //           refs {
  //             nodes {
  //               name
  //               target {
  //                 oid
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // `);
  // const node = allVersions.githubData?.data?.repository?.refs?.nodes?.find(
  //   (item) => item?.target?.oid === process.env.GATSBY_VERCEL_GIT_COMMIT_SHA,
  // );
  // return node?.name ?? FALLBACK_VERSION;
};

export default useSiteVersion;
