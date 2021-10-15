'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "266e6138636b35e0c8f1ab90766dc673",
"assets/assets/animations/not_success.json": "e5c6b1d38cb1d3d4f80174abc581eaf7",
"assets/assets/animations/success.json": "9e3c6d2e4593c9285a6de63f7090f2cb",
"assets/assets/on_boarding/img1.png": "30e7156c63062dc33cba326e344df448",
"assets/assets/on_boarding/img2.png": "1846f2e3a8aef6e0bd43e7b9c3c171f3",
"assets/assets/on_boarding/img3.png": "e93b351b54fd8e40db2eccdcbfa64b39",
"assets/assets/translations/en.json": "496091eeb1e369934e4f4dc06aa81fd6",
"assets/assets/translations/ru.json": "7d4c0115727b26c25271741a2129fe4c",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "0bec380ad987c6b7909e9c797f5b6d5d",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/easy_localization/i18n/ar-DZ.json": "acc0a8eebb2fcee312764600f7cc41ec",
"assets/packages/easy_localization/i18n/ar.json": "acc0a8eebb2fcee312764600f7cc41ec",
"assets/packages/easy_localization/i18n/en-US.json": "5bd908341879a431441c8208ae30e4fd",
"assets/packages/easy_localization/i18n/en.json": "5bd908341879a431441c8208ae30e4fd",
"favicon.png": "168b9a9828ddd6635d7580559826d98a",
"icons/Icon-192.png": "11a2201c24c9bf0a56db0aa399741e74",
"icons/Icon-512.png": "99ed68d95daf0a9e97d57f0d21dfdc9c",
"icons/Icon-maskable-192.png": "9cc288e81a5fcb0b1069e4267b5f38d5",
"icons/Icon-maskable-512.png": "9cc288e81a5fcb0b1069e4267b5f38d5",
"index.html": "8ca79d1013c79f18d628709226faa5d2",
"/": "8ca79d1013c79f18d628709226faa5d2",
"info/privacy_en.html": "e5a700c5d79eb03cee478c087e1301d7",
"info/privacy_ru.html": "28622064eedb72460da0859456927049",
"info/support_en.html": "9de8e3fe1f35d67fd93c24b080904445",
"info/support_ru.html": "9e89158960a771ffb73ac43f7fe1833c",
"main.dart.js": "fe8b79d1590625a9940d75996a2a1589",
"manifest.json": "5c383b4c966d7f13a05b84ec07a04df4",
"splash/img/dark-1x.png": "ab979e750e1725a1de4b24dfe5c65daa",
"splash/img/dark-2x.png": "7e5cfae80136da887d583595e3d373e1",
"splash/img/dark-3x.png": "04f3a740b82a1d0ca90ac58ef4082ae4",
"splash/img/dark-4x.png": "9827238a2d89c709ceb03dfe20bb80d2",
"splash/img/light-1x.png": "ab979e750e1725a1de4b24dfe5c65daa",
"splash/img/light-2x.png": "7e5cfae80136da887d583595e3d373e1",
"splash/img/light-3x.png": "04f3a740b82a1d0ca90ac58ef4082ae4",
"splash/img/light-4x.png": "9827238a2d89c709ceb03dfe20bb80d2",
"splash/style.css": "a089b78db521fe707c16c83041319962",
"version.json": "6571c0eb91f1ef50a70ea634f439d979"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
