import useSWR from 'swr';
import useFetcher from './useFetcher';

interface Footer {
  __typename: 'Footer';
}

/**
 * Fetches the section corresponding to the footer and finds the nodes within it
 * to transform into sections and links
 */
const useFooterData = () => {
  const { data, error } = useSWR<Footer, Error>('/api/footer', useFetcher);
  return {
    data,
    isLoading: !error && !data,
    error,
  };

  // graphql`
  //   query Footer {
  //     allContentfulSection(filter: { title: { eq: "Footer" } }) {
  //       nodes {
  //         blocks {
  //           ... on ContentfulLink {
  //             title
  //             url
  //           }
  //           ... on ContentfulSection {
  //             blocks {
  //               ... on ContentfulLink {
  //                 url
  //                 title
  //                 icon {
  //                   icon
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // `)
};

export default useFooterData;
