console.log("this is a service worker");
const CACHE_FILES = [
    "/",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/favicon.ico",
    "/icons/icon-512x512.png",
    "/icons/icon-192x192.png",

  ];

  const CACHE = "static-cache-v2";
  const DATA_CACHE = "data-cache-v1";

  self.addEventListener("install", function (e) {
    e.waitUntil(
      caches.open(CACHE).then((cache) => cache.add("/api/transaction"))
    );

    e.waitUntil(
      caches.open(CACHE).then((cache) => cache.addAll(CACHE_FILES))
    );

    self.skipWaiting();
  });

  self.addEventListener("activate", function(e) {
    e.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE && key !== DATA_CACHE) {
              return caches.delete(key);
            }
          })
        );
      })
    );

    self.clients.claim();
  });

  self.addEventListener("fetch", function(e) {
    if (e.request.url.includes("/api/")) {
      e.respondWith(
        caches.open(DATA_CACHE).then(cache => {
          return fetch(e.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }

              return response;
            })
            .catch(err => {
              return cache.match(e.request);
            });
        }).catch(err => console.log(err))
      );

      return;
    }

    e.respondWith(
      caches.open(CACHE).then(cache => {
        return cache.match(e.request).then(response => {
          return response || fetch(e.request);
        });
      })
    );
  });