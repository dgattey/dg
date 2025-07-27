import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import { ErrorLayout } from 'components/layouts/ErrorLayout';

export type PageProps = {
  /**
   * What kind of error we encountered
   */
  statusCode: number;
};

/**
 * Error pages should use getInitialProps to access runtime error context.
 * Keep error pages simple and avoid dynamic data fetching to prevent hydration issues.
 */
Page.getInitialProps = async (context: NextPageContext) => {
  const errorProps = await NextErrorComponent.getInitialProps(context);
  const { res, err } = context;
  const errorCode = err?.statusCode ?? 500;
  const statusCode = res ? res.statusCode : errorCode;

  return {
    ...errorProps,
    statusCode,
  };
};

/**
 * Generic error page, for 500s/etc
 */
function Page({ statusCode }: PageProps) {
  return <ErrorLayout statusCode={statusCode} />;
}

export default Page;
