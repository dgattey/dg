/*global workbox:true*/
/*eslint no-undef: "error"*/
"use strict";

/**
 * Configuration & setup
 * - Set name for precache & runtime cache
 * - Skip waiting and claim clients so we take over from any old workers
 * - Also make sure that if we are an old worker, we force reload the page to get freshest stuff
 */
const staticCacheName = "static",
	vendorCacheName = "vendor-static",
	imageCacheName = "images",
	offlinePage = "/offline.html";

workbox.core.setCacheNameDetails({
	precache: "precache",
	prefix: "dg",
	suffix: "prod",
	runtime: "site",
});
workbox.skipWaiting();
workbox.clientsClaim();

var isRefreshing = false;

var refreshWindow = function() {
	if (isRefreshing) {
		return;
	}
	isRefreshing = true;
	window.location.reload();
};

self.addEventListener("controllerchange", refreshWindow);

/**
 * Enables navigation preload which we use in our default handler
 */
workbox.navigationPreload.enable();

/**
 * Precaching all the things!
 * - All data is specified in _config.yml
 * - This empty array will be filled out via jekyll
 */
workbox.precaching.precacheAndRoute([]);

/**
 * Routing for different filetypes & endpoints
 * - Force 404 page to network only since we don't need it offline
 * - Force all analytics calls to network only
 * - Force all p.gif calls (Adobe's check to see if you can use the font) to
 *   network only. If this is cached, the cache grows and grows
 * - Cache the actual font files (use.typekit.net/af) for 120 days
 * - Cache fonts stylesheets for one day
 * - Cache js, css, and json for six hours
 * - Cache up to 60 images for 30 days
 */

const vendorRouteConfiguration = function(hours) {
	return {
		cacheName: vendorCacheName,
		plugins: [
			new workbox.cacheableResponse.Plugin({
				statuses: [0, 200],
			}),
			new workbox.expiration.Plugin({
				maxAgeSeconds: 60 * hours,
			}),
		],
	}
};

workbox.routing.registerRoute(
	/404.html/,
	workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
	/^https?:\/\/www\.google-analytics\.com/,
	workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
	/^https?:\/\/*google*\.com/,
	workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
	/^https?:\/\/.*.typekit\.net\/p\.gif/,
	workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
	/^https?:\/\/.*.typekit\.net\/af/,
	workbox.strategies.cacheFirst(vendorRouteConfiguration(60 * 24 * 120))
);
workbox.routing.registerRoute(
	/^https?:\/\/.*.typekit\.net/,
	workbox.strategies.cacheFirst(vendorRouteConfiguration(60 * 24))
);
workbox.routing.registerRoute(
	/.*\.(?:js|css|json)$/,
	workbox.strategies.cacheFirst({
		cacheName: staticCacheName,
		plugins: [
			new workbox.expiration.Plugin({
				maxAgeSeconds: 60 * 60 * 6,
			}),
		]
	})
);
workbox.routing.registerRoute(
	/\.(?:png|gif|jpg|jpeg|svg|webp|ico)$/,
	workbox.strategies.cacheFirst({
		cacheName: imageCacheName,
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
		// Use the preloaded response, if it's there
		const preloadResponse = await args.preloadResponse;

		if (preloadResponse) {
			return preloadResponse;
		}

		// Otherwise, try network first with a fallback to the offline page
		const response = await workbox.strategies.networkFirst().handle(args);

		return response || await caches.match(offlinePage);
	} catch (error) {
		return await caches.match(offlinePage);
	}
};

workbox.routing.setDefaultHandler(fetchWithOfflineFallback);
workbox.routing.setCatchHandler(({event}) => {
	switch (event.request.destination) {
	case "document":
		return caches.match(offlinePage);
	default:
		return Response.error();
	}
});
