export interface WebhookSubscriptionConfig {
  /**
   * Which api endpoint this webhook corresponds to
   */
  endpoint: string;

  /**
   * Value used as client_id
   */
  id: string | undefined;

  /**
   * Value used as client_secret
   */
  secret: string | undefined;

  /**
   * The value used to verify the webhook callback
   */
  verifyToken: string | undefined;

  /**
   * Use this as the app-specific callback - url at dylangattey.com
   */
  callbackUrl: string | undefined;

  /**
   * Standard HTTP headers for the endpoint
   */
  headers: Record<string, string>;
}
