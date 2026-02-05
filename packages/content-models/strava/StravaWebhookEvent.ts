import * as v from 'valibot';

/**
 * Base fields present in all Strava webhook events.
 */
const baseWebhookFields = {
  /**
   * The action that generated this event.
   */
  aspect_type: v.picklist(['create', 'update', 'delete']),
  /**
   * Unix timestamp when the event occurred.
   */
  event_time: v.optional(v.number()),
  /**
   * Activity or athlete id.
   */
  object_id: v.number(),
  /**
   * The athlete who owns the activity.
   */
  owner_id: v.optional(v.number()),
  /**
   * The subscription id for this webhook.
   */
  subscription_id: v.optional(v.number()),
};

/**
 * Schema for activity webhook events. Updates is optional and contains
 * only the fields that changed (Strava sends partial updates).
 */
const activityWebhookSchema = v.looseObject({
  ...baseWebhookFields,
  object_type: v.literal('activity'),
  /**
   * Partial payload with only the changed fields.
   */
  updates: v.optional(
    v.looseObject({
      private: v.optional(v.picklist(['true', 'false'])),
      title: v.optional(v.string()),
      type: v.optional(v.string()),
    }),
  ),
});

/**
 * Schema for athlete webhook events (e.g., deauthorization).
 */
const athleteWebhookSchema = v.looseObject({
  ...baseWebhookFields,
  object_type: v.literal('athlete'),
  /**
   * Athlete update payload.
   */
  updates: v.optional(
    v.looseObject({
      authorized: v.optional(v.literal('false')),
    }),
  ),
});

/**
 * Schema for webhook events sent by Strava.
 */
export const stravaWebhookEventSchema = v.union([activityWebhookSchema, athleteWebhookSchema]);

export type StravaWebhookEvent = v.InferOutput<typeof stravaWebhookEventSchema>;

/**
 * Validates a webhook payload and returns the result with detailed errors.
 */
export const validateStravaWebhookEvent = (input: unknown) =>
  v.safeParse(stravaWebhookEventSchema, input);
