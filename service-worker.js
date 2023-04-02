// Service worker adapted from: https://developers.google.com/web/fundamentals/primers/service-workers
const CACHE_NAME = 'stemplayeronline-beta-cache-v2';
const urlsToCache = [
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
	'/img/logo-512.png',
	'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
	'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu72xKOzY.woff2',
	'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
	'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fCRc4EsA.woff2',
	'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
	'https://unpkg.com/web-audio-daw'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    // Cache urlsToCache
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Delete old caches
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete())
      );
    })
    /*
    // Nav preload
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
    */
  )
  // self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return cacheRes || fetch(event.request);
    })
  );
});
