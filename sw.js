const staticCacheName = "s-app-v1";
const dynamicCacheName = "d-app-v1";

const cacheAddUrls = [
  "./offline.html",
  "./index.html",
  "./manifest.json",
  "./src/css/main.css",
];

self.addEventListener("install", async (e) => {
  const cacheOpen = await caches.open(staticCacheName);
  await cacheOpen.addAll(cacheAddUrls);
});

self.addEventListener("activate", async (e) => {
  const cahesNames = await caches.keys();
  await Promise.all(
    cahesNames
      .filter((name) => name !== staticCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name))
  );
});

self.addEventListener("fetch", async (e) => {
  const request = e.request;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(request));
  } else {
    e.respondWith(networkFirst(request));
  }
});

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  return cached ?? (await fetch(request));
};

const networkFirst = async (request) => {
  const cache = await caches.open(dynamicCacheName);

  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached ?? (await caches.match("./offline.html"));
  }
};
