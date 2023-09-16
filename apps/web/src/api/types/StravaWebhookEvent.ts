interface ActivityUpdate {
  /**
   * Name of the activity
   */
  title: string;

  /**
   * The type of the activity, like 'Ride' or 'IceSkate' or Run
   */
  type: string;

  /**
   * Visibility of the activity
   */
  private: 'true' | 'false';
}

interface AthleteUpdate {
  /**
   * This happens on deauthorization events
   */
  authorized: 'false';
}

/**
 * This is the event that Strava sends when we're subscribed to a webhook
 */
export type StravaWebhookEvent = {
  /**
   * Activity or athlete id
   */
  object_id: number;

  /**
   * The action that generated this event
   */
  aspect_type: 'create' | 'update' | 'delete';
} & (
  | {
      /**
       * This event contains activity updates
       */
      object_type: 'activity';
      updates: ActivityUpdate;
    }
  | {
      /**
       * This event contains deauthorization updates for an athlete
       */
      object_type: 'athlete';
      updates: AthleteUpdate;
    }
);

/**
 * What the update pertains to
 */
export type ObjectType = StravaWebhookEvent['object_type'];
