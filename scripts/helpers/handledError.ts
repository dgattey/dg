import type { WebhookType } from 'api/types/WebhookType';
import type { Response } from 'node-fetch';
import { isRecord } from '../../src/api/parsers';

/**
 * Strava's API returns errors like this
 */
type JsonResponseWithErrors = {
  errors?: Array<unknown>;
};

/**
 * Typeguard for checking for an error
 */
const isJsonWithErrors = (
  json: Record<string, unknown> | unknown | undefined,
): json is JsonResponseWithErrors => isRecord(json) && json?.errors !== undefined;

/**
 * Prints out an error for the user for a given webhook if necessary -
 * and returns if it handled the error successfully.
 */
const handledError = async (webhookType: WebhookType, data: Response) => {
  if (data.status >= 200 && data.status < 300) {
    return false;
  }

  const json = await data.json();
  if (!isJsonWithErrors(json)) {
    console.error('🚨 Unknown error', data.status, json);
    return true;
  }
  console.error(`🚨 Error from ${webhookType} (${data.status}):`, json.errors);
  return true;
};

export default handledError;
