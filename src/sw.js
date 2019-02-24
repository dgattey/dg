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
				maxAgeSeconds: 60 * 60 * hours,
			}),
		],
	};
};

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
	workbox.strategies.cacheFirst(vendorRouteConfiguration(24 * 120))
);
workbox.routing.registerRoute(
	/^https?:\/\/.*.typekit\.net/,
	workbox.strategies.cacheFirst(vendorRouteConfiguration(24))
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
 * - If it's a POST request, it'll default to networkOnly
 * - The regular catch handler is set up to return an offline page if we can't find something that matches.
 *   Otherwise, we'll return an error response
 */
const offlinePageWithName = async (pageURL) => {
	const cachedResponse = await caches.match(offlinePage);

	return responseWithReplacedURL(cachedResponse, pageURL, 503)
};

/**
 * Takes a page and replaces "{url}" with the page's URL
 */
const responseWithReplacedURL = async (existingResponse, pageURL, status) => {
	if (!status) {
		status = existingResponse.status;
	}

	const constructedResponse = {
		status: status,
		statusText: existingResponse.statusText,
		headers: existingResponse.headers
	};

	// Replace the requisite strings in the page with the real URL and status.
	return existingResponse.text().then(function(body) {
		const left = "&lt;"
		const right = status + "&gt;";

		var newContent = body.replace(/\? page/, pageURL);
		newContent = newContent.replace(/&lt;error&gt;/, left + right);
		newContent = newContent.replace(/&lt;\/error&gt;/, left + "/" + right);

		return new Response(newContent, constructedResponse);
	});
};

const fetchWithOfflineFallback = async (context) => {
	const defaultStrategy = workbox.strategies.networkFirst();
	const postStrategy = workbox.strategies.networkOnly();

	try {
		// If it's a POST request, use networkOnly
		if (context.event.request.method === 'POST') {
			return await postStrategy.handle(context);
		}

		const pageURL = context.event.request.url;

		// Use the preloaded response, if it's there
		const preloadResponse = await context.preloadResponse;

		if (preloadResponse) {
			return preloadResponse;
		}

		// Otherwise, try network first with a fallback to the 404 page
		const response = await defaultStrategy.handle(context);

		// If the response 404'd, we should replace the page URL and return it
		if (response && response.status == 404) {
			return responseWithReplacedURL(response, pageURL);
		}

		// Otherwise, let's return the response or an offline page
		return response || offlinePageWithName(pageURL);
	} catch (error) {
		console.log("ERROR! ", error);
		// Try one last time to grab the offline page
		return offlinePageWithName(context.event.request.url);
	}
};

workbox.routing.setDefaultHandler(fetchWithOfflineFallback);
workbox.routing.setCatchHandler(({event}) => {
	switch (event.request.destination) {
	case "document":
		return offlinePageWithName(event.request.url);
	default:
		return Response.error();
	}
});
