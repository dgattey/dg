import useSWR from 'swr';
import useFetcher from './useFetcher';

interface Header {
  __typename: 'Header';
}

/**
 * Fetches the section corresponding to the header and finds the nodes within it
 * to transform into links
 */
const useHeaderData = () => {
  const { data, error } = useSWR<Header, Error>('/api/header', useFetcher);
  return {
    data,
    isLoading: !error && !data,
    error,
  };
};

// useStaticQuery<GatsbyTypes.HeaderQuery>(graphql`
//   query Header {
//     allContentfulSection(filter: { title: { eq: "Header" } }) {
//       nodes {
//         blocks {
//           ... on ContentfulLink {
//             title
//             url
//           }
//         }
//       }
//     }
//   }
// `);

export default useHeaderData;
