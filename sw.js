const CACHE_NAME = "premoldeados-offline-v1";

const ARCHIVOS = [
  "/avance.html",
  "/manifest.json"
];

// Instalar y guardar la página para poder abrirla sin conexión
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
  );

  self.skipWaiting();
});

// Activar nueva versión
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Si no hay Internet, intentar usar lo guardado en el celular
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        const copia = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, copia))
          .catch(() => {});

        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then(response => response || caches.match("/avance.html"))
      )
  );

});
