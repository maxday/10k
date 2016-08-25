(function(window,document){/*!
 * This is the activation handler. It runs after the worker is installed.
 * It handles the deletion of expired caches.
 */
addEventListener('activate', event => {
	event.waitUntil(
		caches.keys()
			.then(keys => {
				const expired = keys.filter(isCacheExpired);
				const deletions = expired.map(key => caches.delete(key));
				return Promise.all(deletions);
			})
			.catch(err => {
				warn(`activate: ${err}`);
			})
			.then( clients.claim() )
	);
});

/*!
 * This is the fetch handler. It runs upon every request, but it only acts upon
 * requests that return true when passed to `isCacheableRequest`. It both serves
 * requests from the cache and adds requests to the cache.
 */
addEventListener('fetch', event => {
	const request = event.request;

	if ( isCacheableRequest(request) )
	{
		const cacheType = getCacheType(request);
		const procedure = procedures.get(cacheType);
		
		event.respondWith(
			procedure(request, cacheType)
				.catch(err => {
					warn( `fetch: ${err}` );
					return matchFallback(request);
				 })
		);
	}
});

/*!
 * This is the installation handler. It runs when the worker is first installed.
 * It precaches the asset paths defined by the `REQUIRED_DEPENDENCIES`.
 */
addEventListener( 'install', event => {
	const requests = REQUIRED_DEPENDENCIES.map(url => {
		return new Request(url, fetchOptions.get(CACHE_TYPES.static));
	});

	event.waitUntil(
		openCache(CACHE_TYPES.static)
			.then(cache => {
				return cache.addAll(requests);
			 })
			.catch(err => {
				warn(`install: ${err}`);
			 })
			.then( skipWaiting() )
	);
});

/*!
 * This is the message event handler. It receives commands from the client (for
 * example, to clean up cache sizes).
 */
addEventListener('message', event => {
	// Trim caches if the `trimCaches` command is sent
	if (event.data.command == 'trimCaches') {
		// Trim caches
		for ( let cache in CACHE_TYPES )
		{
			let maxItems = cacheSizeLimits.get(cache);
			if ( maxItems )
			{
				limitCacheSize(cache, maxItems);
			}
		}
	}
});



/**
 * Service Worker
 * Adapted from Smashing Magazine’s (https://www.smashingmagazine.com/serviceWorker.js)
 */

// jshint strict:false
'use strict';

/*
 * This is a simple test to ensure that all of the ES2015 features used here are
 * present in the browser before executing. If it fails, the worker will not be
 * installed. As of March 2016, all browsers that support service worker APIs
 * also support these features.
 */
try {
	[
		'var {$$test} = {$$test: null}',
		'[$$test] = [null]',
		'$$test = Object.assign({}, {})',
		'$$test = (...args) => args',
		'$$test = new Map()',
		'$$test = new Set()',
		'delete $$test'
	].forEach(eval);
}
catch( err )
{
	// jshint undef:false
	// console.warn( err );
	throw 'Service worker unmet feature dependencies';
}

// Cache Key
const VERSION = '1471977617589';

// Enable `console` debugging messages
const SW_DEBUG = false;

// This is shortcut reference to the registration scope
const SCOPE_ORIGIN = trimSlash( registration.scope );

// This object represents the cache "buckets" that responses will be placed into
const CACHE_TYPES = {
	content: 'content',
	image: 'image',
	other: 'other',
	static: 'static'
};

// This is the URL `hostname` whitelist for incoming `fetch` event requests.
const hostsAllowed = new Set([
	'localhost',
	'10kapart.blob.core.windows.net',
	'a-k-apart.com',
	'cdnjs.cloudflare.com'
]);

// This is the maximum number of entries that certain caches are allowed to contain.
const cacheSizeLimits = new Map([
	[CACHE_TYPES.image, 100],
	[CACHE_TYPES.content, 20],
	[CACHE_TYPES.other, 20]
]);

// These are the options supplied to instances of `caches.match()` for each corresponding cache bucket.
const matchOptions = new Map([
  [CACHE_TYPES.static, {
    ignoreSearch: true
  }]
]);

// These are the options supplied to instances of `fetch()` for each bucket.
const fetchOptions = new Map([
	[CACHE_TYPES.static, {
		credentials: 'same-origin',
		cache: 'reload'
	}]
]);

// These are fallback page URLs to serve as alternatives to pages requested.
const fallbackPages = new Map([
	[undefined, '/offline']
]);

// These are fallback image URLs to serve as alternatives to images requested.
const fallbackImages = new Map([
	[location.hostname + '/i/j', '/i/j/offline.png'],
	['10kapart.blob.core.windows.net/screenshots/', '/i/p/offline.png'],
	[location.hostname, '/i/offline.png']
]);

/*
 * These are regex assertions to make against requests in order to classify the
 * cache they belong in.
 */
const headerTests = new Map([
	[CACHE_TYPES.static, header =>
		/^(text|application)\/(css|javascript)/.test(header)
	],

	[CACHE_TYPES.image, header =>
		/^image\//.test(header)
	],

	[CACHE_TYPES.content, header =>
		/^text\/(html|xml|xhtml)/.test(header)
	]
]);

/*
 * These are boolean assertions to make against requests in order to classify
 * the cache they belong in.
 */
const cacheCriteria = new Map([
	[CACHE_TYPES.static, req => [
		isPrecacheRequest(req)
	]],

	[CACHE_TYPES.content, req => [
		isLocalRequest(req),
		isPageRequest(req),
		req.mode === 'navigate'
	]],

	[CACHE_TYPES.image, req => [
		isImageRequest(req)
	]],

	[CACHE_TYPES.other, req => [
		isLocalRequest(req)
	]]
]);

// These are `fetch` event proceedures to follow for each content/cache type.
const procedures = new Map([
	[CACHE_TYPES.content, retrievePage],
	[CACHE_TYPES.static, retrieveAsset],
	[CACHE_TYPES.image, retrieveAsset],
	[CACHE_TYPES.other, req => fetch(req)],
	[undefined, req => fetch(req)]
]);

// Log warnings
function warn( ...args )
{
	if ( SW_DEBUG )
	{
		return console.warn.call( console, ...args );
	}
}

// Log status messages to the console.
function log( ...args )
{
	if ( SW_DEBUG )
	{
		return console.log.call( console, ...args );
	}
}

// This is the list of files to precache.
const REQUIRED_FILES = [
	'/c/d.min.css',
	'/c/a.min.css',
	'/j/main.min.js',
	'/i/offline.png'	
];

// This is the array of pages to precache.
const REQUIRED_PAGES = [
	'/offline'
];

// This is a convenience wrapper for the required files and pages.
const REQUIRED_DEPENDENCIES = [].concat(
	REQUIRED_FILES,
	REQUIRED_PAGES
);

// Remove the trailing slash from a URL path.
function trimSlash( str )
{
	return str.replace(/(.)\/$/, '$1');
}

// Transform a base name into a prefixed cache key.
function toCacheName( str )
{
	const delim = '-';
	return [VERSION, str].join(delim);
}

// Check if a value is equal to `null` or `undefined`.
function isNil( val )
{
	return val === null || val === undefined;
}

// Check if a value is equal to `true`.
function isTrue( val )
{
	return val === true;
}

// Check is a cache key is expired (and should be deleted).
function isCacheExpired( cacheKey )
{
	return ! cacheKey.startsWith(VERSION);
}

// Check if a request is considered "cacheable".
function isCacheableRequest( req )
{
	const {url, method, referrer} = req;
	const {hostname, pathname, search} = new URL(url);	
	if (method !== 'GET')
	{
		return false;
	}	
	if (!hostsAllowed.has(hostname))
	{
		return false;
	}	
	return true;
}

// Check if a request is local (from the same origin).
function isLocalRequest( req )
{
	return req.url.startsWith(SCOPE_ORIGIN);
}

// Check if a request appears to be for a page.
function isPageRequest( req )
{
	return getContentType(req) === CACHE_TYPES.content;
}

// Check if a request appears to be for an image.
function isImageRequest( req )
{
	return getContentType(req) === CACHE_TYPES.image;
}

// Check if a request should already have a precached response.
function isPrecacheRequest( req )
{
	const url = new URL( req.url );
	const match = REQUIRED_DEPENDENCIES.find(
		path => trimSlash( url.pathname ) === trimSlash( path )
	);
	return ! isNil( match );
}

// Infer the content type of a request based on its `headers`.
function getContentType( req )
{
	const header = req.headers.get('Accept');
	const types = [
		CACHE_TYPES.static,
		CACHE_TYPES.content,
		CACHE_TYPES.image
	];

	return types.find(type => {
		const test = headerTests.get( type );
		if ( ! test ){ return; }
		return test(header);
  	});
}

// Infer the cache type for a request based on its properties.
function getCacheType (req) {
	const types = [
		// "Static" should tested first due to overlapping criteria.
		CACHE_TYPES.static,
		CACHE_TYPES.content,
		CACHE_TYPES.image,
		CACHE_TYPES.other
	];

	return types.find(type => {
		const test = cacheCriteria.get( type );
		if ( ! test ){ return; }
		const results = test( req );
		return results.every(isTrue);
	});
}

// Open a cache by name.
function openCache( name )
{
	return caches.open( toCacheName( name ) );
}

// Open a cache based on the inferred cache type for a request.
function openCacheFor( req )
{
	const type = getCacheType( req );
	return openCache( type );
}

// Get a response from the network, and also cache it.
function fetchRequest( req, options )
{
	return fetch( req, options ).then(res => {

		if ( res.ok )
		{
			const clone = res.clone();
			
	  		openCacheFor(req).then(cache => {
				return cache.put(req, clone);
			});
		}
		
		return res;
	});
}

// Get a response from the cache.
function matchRequest( req, options )
{
	return caches.match(req, options).then(res => {
		return res || Promise.reject(
			`matchRequest: could not match ${req.url}`
		);
	});
}

// Get a fallback response based on the properties of a request.
function matchFallback( req )
{
	const {hostname, pathname} = new URL( req.url );

	if (isPageRequest(req)) {
		const pathkey = trimSlash( pathname );
		const page = fallbackPages.get( pathkey ) || fallbackPages.get( undefined );
		const cacheId = REQUIRED_PAGES.find( path => path === page );	
		return caches.match( cacheId );
	}	
	if ( isImageRequest( req ) )
	{
		const image = fallbackImages.get( hostname );
		const cacheId = REQUIRED_FILES.find( path => path.endsWith( image ) );	
		return caches.match( cacheId );
	}	
	// Use an empty response if nothing better can be found in a cache.
	return Promise.resolve( new Response() );
}

// Delete items from a cache until the number of entries is less than a predefined limit.
function limitCacheSize( cacheName, maxItems )
{
	return openCache(cacheName)
		.then(cache => {
			return Promise.all([cache, cache.keys()]);
		})
		.then(([cache, keys]) => {
			const deletions = [];
			const limit = Math.abs(maxItems);

			while ( keys.length > limit )
			{
				deletions.push(
					cache.delete( keys.shift() )
				);
			}

			return Promise.all(deletions);
		})
		.then(deleted => {
			return deleted.filter( isTrue ).length;
		})
		.catch(err => {
			warn( `limitCacheSize: ${err}` );
		});
}

// Cache-prioritized fetch handling proceedure
function retrieveAsset( req, type )
{
	if ( type === CACHE_TYPES.static )
	{
		req = new Request( req.url );
	}
	return matchRequest(req, matchOptions.get(type))
			.catch(err => {
				warn(`retrieveAsset: ${err}`);
				return fetchRequest(req);
			 });
}

// Network-prioritized fetch handling proceedure
function retrievePage( req, type )
{
	return fetchRequest(req)
			.catch(err => {
				warn( `retrievePage: ${err}` );
				return matchRequest( req, matchOptions.get(type) );
			 });
}

// Epilogue for all JavaScript in this folder

}(this,this.document));