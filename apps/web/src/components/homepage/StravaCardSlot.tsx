import 'server-only';

import { isMissingTokenError } from '@dg/services/clients/MissingTokenError';
import { redirect } from 'next/navigation';
import { getLatestActivity } from '../../services/strava';
import { StravaCard } from './StravaCard';

export async function StravaCardSlot() {
  try {
    const activity = await getLatestActivity();
    return <StravaCard activity={activity} />;
  } catch (error) {
    // In development, redirect to the dev page to set up OAuth
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect('/dev');
    }
    throw error;
  }
}
