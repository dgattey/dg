'use strict';

/**
 * Configuration & setup
 * - Set name for precache & runtime cache
 * - Skip waiting and claim clients so we take over from any old workers
 * - Also make sure that if we are an old worker, we force reload the page to get freshest stuff
 */
const offlinePage = '/offline/index.html';
workbox.core.setCacheNameDetails({
	precache: 'precache',
	prefix: 'dg',
	suffix: 'v1',
	runtime: 'runtime',
});
workbox.skipWaiting();
workbox.clientsClaim();
var isRefreshing;
self.addEventListener('controllerchange',
	function() {
		if (isRefreshing) {
			return;
		}
		isRefreshing = true;
		window.location.reload();
	}
);

/**
 * Precaching all the things!
 * - All data is specified in _config.yml
 * - This empty array will be filled out via jekyll
 */
workbox.precaching.precacheAndRoute([]);

/**
 * Routing for different filetypes & endpoints
 * - Stale while revalidate for js, css, and json
 * - State while revalidate for Google Fonts stylesheets
 * - Cache Google Fonts font files for 120 days
 * - Cache up to 60 images for 30 days
 */
workbox.routing.registerRoute(
	/\.(?:js|css|json)$/,
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'static'
	})
);
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
workbox.routing.registerRoute(
	/^https?:\/\/fonts\.gstatic\.com/,
	workbox.strategies.cacheFirst({
		cacheName: 'gstatic',
		plugins: [
			new workbox.cacheableResponse.Plugin({
				statuses: [0, 200],
			}),
			new workbox.expiration.Plugin({
				maxAgeSeconds: 60 * 60 * 24 * 120,
			}),
		],
	})
);
workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  workbox.strategies.cacheFirst({
	cacheName: 'images',
	plugins: [
	  new workbox.expiration.Plugin({
		maxEntries: 60,
		maxAgeSeconds: 60 * 60 * 24 * 30,
	  }),
	],
  }),
);

/**
 * Default handler & catch handler
 * - There's a default handler here that will fetch using networkFirst, but
 *   if offline, will try to return an offline page
 * - The regular catch handler is set up to return an offline page if we can't find something that matches.
 *   Otherwise, we'll return an error response
 */
const fetchWithOfflineFallback = async (args) => {
	try {
		const response = await workbox.strategies.networkFirst().handle(args);
		return response || await caches.match(offlinePage);
	} catch (error) {
		return await caches.match(offlinePage);
	}
};
workbox.routing.setDefaultHandler(fetchWithOfflineFallback);
workbox.routing.setCatchHandler(({event}) => {
	if (event.request.cache === 'only-if-cached' &&
		event.request.mode !== 'same-origin') {
		return;
	}
	switch (event.request.destination) {
	case 'document':
		return caches.match(offlinePage);
	default:
		return Response.error();
	}
});

/**
 * Google Analytics
 * - Now available while offline! It'll send when back online
 */
workbox.googleAnalytics.initialize();
