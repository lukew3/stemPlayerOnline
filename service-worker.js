// Service worker adapted from: https://developers.google.com/web/fundamentals/primers/service-workers
var CACHE_NAME = 'stemplayeronline-beta-cache-v1';
var urlsToCache = [
	'/',
	'/main.css',
	'/js/app.js',
	'/js/Audio.js',
	'/js/data.js',
	'/js/interface.js',
	'/js/keyboardControls.js',
	'/js/Lights.js',
	'/js/Loop.js',
	'/img/collapseArrow.svg',
	'/img/discordIcon.svg',
	'/img/folder.svg',
	'/img/logo-512.png'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
        if ('navigationPreload' in self.registration) {
          await self.registration.navigationPreload.enable();
        }
  })());
  // Delete old caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === CACHE_NAME) return;
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});                                                                                                     

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

