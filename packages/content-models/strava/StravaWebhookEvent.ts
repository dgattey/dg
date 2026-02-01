import * as v from 'valibot';

/**
 * Schema for webhook events sent by Strava.
 */
export const stravaWebhookEventSchema = v.union([
  v.looseObject({
    /**
     * The action that generated this event.
     */
    aspect_type: v.picklist(['create', 'update', 'delete']),
    /**
     * Activity or athlete id.
     */
    object_id: v.number(),
    /**
     * Activity updates with a partial payload.
     */
    object_type: v.literal('activity'),
    updates: v.looseObject({
      private: v.picklist(['true', 'false']),
      title: v.string(),
      type: v.string(),
    }),
  }),
  v.looseObject({
    /**
     * The action that generated this event.
     */
    aspect_type: v.picklist(['create', 'update', 'delete']),
    /**
     * Activity or athlete id.
     */
    object_id: v.number(),
    /**
     * Athlete deauthorization update.
     */
    object_type: v.literal('athlete'),
    updates: v.looseObject({
      authorized: v.literal('false'),
    }),
  }),
]);

export type StravaWebhookEvent = v.InferOutput<typeof stravaWebhookEventSchema>;

/**
 * Runtime check for webhook payloads.
 */
export const isStravaWebhookEvent = (input: unknown): input is StravaWebhookEvent =>
  v.safeParse(stravaWebhookEventSchema, input).success;
