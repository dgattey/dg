import { log } from '@dg/shared-core/helpers/log';
import { type NextRequest, NextResponse } from 'next/server';
import {
  createWebhookSubscription,
  deleteWebhookSubscription,
  listWebhookSubscriptions,
} from '../../../../services/strava';

const isDevEnvironment = () =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

const notFoundInProduction = () => {
  if (!isDevEnvironment()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return null;
};

/**
 * Lists all current webhook subscriptions.
 * Dev-only endpoint.
 */
export async function GET() {
  const notFound = notFoundInProduction();
  if (notFound) {
    return notFound;
  }

  try {
    const subscriptions = await listWebhookSubscriptions('strava');
    return NextResponse.json({ subscriptions });
  } catch (error) {
    log.error('Failed to list webhook subscriptions', { error });
    return jsonError('Failed to list subscriptions', 500);
  }
}

/**
 * Creates a new webhook subscription.
 * Dev-only endpoint.
 */
export async function POST() {
  const notFound = notFoundInProduction();
  if (notFound) {
    return notFound;
  }

  try {
    const subscription = await createWebhookSubscription('strava');
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    log.error('Failed to create webhook subscription', { error });
    const message = error instanceof Error ? error.message : 'Failed to create subscription';
    return jsonError(message, 500);
  }
}

/**
 * Deletes a webhook subscription by ID.
 * Dev-only endpoint.
 * Expects query param: ?id=<subscriptionId>
 */
export async function DELETE(request: NextRequest) {
  const notFound = notFoundInProduction();
  if (notFound) {
    return notFound;
  }

  const subscriptionId = request.nextUrl.searchParams.get('id');
  if (!subscriptionId) {
    return jsonError('Missing subscription id', 400);
  }

  const id = Number.parseInt(subscriptionId, 10);
  if (Number.isNaN(id)) {
    return jsonError('Invalid subscription id', 400);
  }

  try {
    await deleteWebhookSubscription('strava', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Failed to delete webhook subscription', { error, subscriptionId });
    const message = error instanceof Error ? error.message : 'Failed to delete subscription';
    return jsonError(message, 500);
  }
}
