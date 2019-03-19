/* global workbox:true */
/* eslint no-undef: "error" */
"use strict";

/**
 * Configuration & setup
 * - Set name for precache & runtime cache
 * - Skip waiting and claim clients so we take over from any old workers
 * - Also make sure that if we are an old worker, we force reload the page to get freshest stuff
 */
const version = "v1.18.5",
  cachePrefix = "dg",
  staticCacheName = cachePrefix + "-static-" + version,
  vendorCacheName = cachePrefix + "-vendor-" + version,
  imageCacheName = cachePrefix + "-images-" + version,
  offlinePage = "/503.html",
  genericErrorPage = "/500.html";

workbox.core.setCacheNameDetails({
  precache: "pre",
  prefix: cachePrefix,
  suffix: version
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
 * - Force all ReportURI to network only
 * - Force all goodreads, google analytics calls to network only
 * - Force all p.gif calls (Adobe's check to see if you can use the font) to
 *   network only. If this is cached, the cache grows and grows
 * - Cache the actual font files (use.typekit.net/af) for 120 days
 * - Force all fonts stylesheets/js to network only for opaque caching probs
 * - Cache js, css, and json for six hours
 * - Cache up to 60 images for 30 days
 */

const vendorRouteConfiguration = function(hours) {
  return {
    cacheName: vendorCacheName,
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * hours
      })
    ]
  };
};

workbox.routing.registerRoute(
  /.*report-uri\.com/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*images\.gr-assets\.com/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*goodreads\.com/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*google-analytics\.com/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*google*\..*/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*\.typekit\.net\/p\.gif/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*\.typekit\.net\/af/,
  workbox.strategies.cacheFirst(vendorRouteConfiguration(24 * 120))
);
workbox.routing.registerRoute(
  /.*\.typekit\.net/,
  workbox.strategies.networkOnly()
);
workbox.routing.registerRoute(
  /.*\.(?:js|css|json)$/,
  workbox.strategies.cacheFirst({
    cacheName: staticCacheName,
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 6
      })
    ]
  })
);
workbox.routing.registerRoute(
  /.*\.(?:png|gif|jpg|jpeg|svg|webp|ico)/,
  workbox.strategies.cacheFirst({
    cacheName: imageCacheName,
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30
      })
    ]
  })
);

/**
 * Returns a generic error page from cache, replacing the error content with
 * status and the actual page URL.
 */
const errorPageForURL = async(pageURL) => {
  const cachedResponse = await caches.match(genericErrorPage);

  return responseWithReplacedErrorContent(cachedResponse, pageURL, 500);
};

/**
 * Returns the offline page from cache, replacing the error content with a 503
 * status and the actual page URL.
 */
const offlinePageForURL = async(pageURL) => {
  const cachedResponse = await caches.match(offlinePage);

  return responseWithReplacedErrorContent(cachedResponse, pageURL, 503);
};

/**
 * Takes an existing response and replaces some error content. Specifically:
 * - Replaces "<error>"" or "</error>" with the actual status code
 * - Replaces "unknown page" with the actual pageURL
 *
 * Note that the status code falls back to the response's status if not defined.
 */
function responseWithReplacedErrorContent(existingResponse, pageURL, status) {
  if (!status) {
    status = existingResponse.status;
  }

  const constructedResponse = {
    status: status === 503 ? 200 : status,
    statusText: existingResponse.statusText,
    headers: existingResponse.headers
  };

  // Replace the requisite strings in the page with the real URL and status.
  return existingResponse.text().then(function(body) {
    const left = "&lt;";
    const right = status + "&gt;";

    var newContent = body.replace(/\unknown page/, pageURL);
    newContent = newContent.replace(/&lt;error&gt;/, left + right);
    newContent = newContent.replace(/&lt;\/error&gt;/, left + "/" + right);

    return new Response(newContent, constructedResponse);
  });
}

/**
 * Handles a standard network response. There are two main components here:
 * - If the response 404'd, we need to replace the placeholder error content
 * - Otherwise, check if we're requesting a document
 * - If a document, return the response or fall back to the offline page
 * - Otherwise, just return the response
 */
function handleResponse(response, pageURL, destination) {
  // If the response 404'd, we should replace the page URL and return it
  if (response && response.status === 404) {
    return responseWithReplacedErrorContent(response, pageURL);
  }

  // Check if we should try returning offline page if response fails
  switch (destination) {
    case "document":
      return response || offlinePageForURL(pageURL);
    default:
      return response;
  }
}

/**
 * Fetches a page, doing all the work to handle edge cases. Specifically:
 * - For not-GET methods, uses networkOnly to not cache them
 * - If there's a preload response, just use that
 * - Everything else is run through handleResponse with networkFirst strategy
 */
const fetchPage = async(context) => {
  const nonGetStrategy = workbox.strategies.networkOnly();

  // If it's non GET request, use networkOnly
  if (context.event.request.method !== "GET") {
    return nonGetStrategy.handle(context);
  }

  // Use the preloaded response, if it's there
  const preloadResponse = await context.preloadResponse;

  if (preloadResponse) {
    return preloadResponse;
  }

  // Otherwise, fetch and handle the response
  const pageURL = context.event.request.url;
  const destination = context.event.request.destination;
  const defaultStrategy = workbox.strategies.networkFirst();
  const response = await defaultStrategy.handle(context);

  return handleResponse(response, pageURL, destination);
};

/**
 * If it's a document, it fetches the fallback error page if possible, or
 * returns a generic response error if not.
 */
function fetchErrorPage(context) {
  const pageURL = context.event.request.url;
  const destination = context.event.request.destination;

  switch (destination) {
    case "document":
      return errorPageForURL(pageURL);
    default:
      return Response.error();
  }
}

workbox.routing.setDefaultHandler(fetchPage);
workbox.routing.setCatchHandler(fetchErrorPage);
