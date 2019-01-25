// Set names for precache & runtime cache
workbox.core.setCacheNameDetails({
	prefix: 'dg',
	suffix: 'v1',
	precache: 'precache',
	runtime: 'runtime-cache'
});

workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);

// Let Service Worker take control ASAP
workbox.skipWaiting();
workbox.clientsClaim();

// Let the jekyll plugin for workbox handle precache based on files
workbox.precaching.precacheAndRoute([]);

// Offline Analytics
workbox.googleAnalytics.initialize();

// Stale while revalidate for all static assets
workbox.routing.registerRoute(
	/\.(?:js|css|json)$/,
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'static'
	})
);

// Stale while revalidate Google Font stylesheets
workbox.routing.registerRoute(
	/^https?:\/\/fonts\.googleapis\.com/,
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'googleapis',
		plugins: [
			new workbox.cacheableResponse.Plugin({
				statuses: [0, 200],
			}),
		],
	})
);

// Cache Google Font fonts for a year
workbox.routing.registerRoute(
	/^https?:\/\/fonts\.gstatic\.com/,
	workbox.strategies.cacheFirst({
		cacheName: 'gstatic',
		plugins: [
			new workbox.cacheableResponse.Plugin({
				statuses: [0, 200],
			}),
			new workbox.expiration.Plugin({
				maxAgeSeconds: 60 * 60 * 24 * 365,
			}),
		],
	})
);

// Cache up to 60 images for up to 30 days
workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  workbox.strategies.cacheFirst({
	cacheName: 'images',
	plugins: [
	  new workbox.expiration.Plugin({
		maxEntries: 60,
		maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
	  }),
	],
  }),
);

// Use stale while revalidate so that we can respond to offline pages gracefully
workbox.routing.setDefaultHandler(
  workbox.strategies.staleWhileRevalidate()
);

// This lets us fallback to an offline URL if not in cache
workbox.routing.setCatchHandler(({event}) => {
  switch (event.request.destination) {
    case 'document':
      return caches.match('/offline/index.html');
    break;

    default:
      // If we don't have a fallback, just return an error response.
      return Response.error();
  }
});