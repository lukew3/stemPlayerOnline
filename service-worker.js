// Service worker adapted from: https://developers.google.com/web/fundamentals/primers/service-workers
var CACHE_NAME = 'stemplayeronline-cache';
var urlsToCache = [
	//'/',
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

