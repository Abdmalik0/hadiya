/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "2be7ed2f3a3d225e5f2dcf126da38f0d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "37275d80d35e3ceefe877a03afae1f19"
  }, {
    "url": "pwa-192x192.png",
    "revision": "264e77b19766fcb515ae1d1e91a82362"
  }, {
    "url": "offline.html",
    "revision": "0e43b7c85a772bc5f74b9beb37e41ef0"
  }, {
    "url": "index.html",
    "revision": "aa32a7e84a1c56ec340e7e92614139eb"
  }, {
    "url": "icon.svg",
    "revision": "587043511e5ab4fa07c8e598cdc9e295"
  }, {
    "url": "favicon.png",
    "revision": "8dbc84e3aa98f96348e5d96a433e2233"
  }, {
    "url": "assets/workbox-window.prod.es5-legacy-BjoASsvm.js",
    "revision": null
  }, {
    "url": "assets/workbox-window.prod.es5-RNCgxoJe.js",
    "revision": null
  }, {
    "url": "assets/polyfills-legacy-DR_8rib9.js",
    "revision": null
  }, {
    "url": "assets/index-legacy-BF9mRAgx.js",
    "revision": null
  }, {
    "url": "assets/index-DpKuO6cD.css",
    "revision": null
  }, {
    "url": "assets/index-B8oYs56p.js",
    "revision": null
  }, {
    "url": "assets/halaba_stadium_hero_mobile-CNMbA7gS.webp",
    "revision": null
  }, {
    "url": "assets/halaba_stadium_hero-DlRnnI6Q.webp",
    "revision": null
  }, {
    "url": "assets/halaba_stadium_hero-D7B7GHYf.jpg",
    "revision": null
  }, {
    "url": "assets/halaba_squad_lineup_1792272200487-IwYXnxcU.webp",
    "revision": null
  }, {
    "url": "assets/halaba_news_match_poster-Bqlk84tk.webp",
    "revision": null
  }, {
    "url": "assets/halaba_news_fasil_draw-D0_u1s76.jpg",
    "revision": null
  }, {
    "url": "assets/halaba_news_crowd_celebration-v-2uq95_.jpg",
    "revision": null
  }, {
    "url": "assets/halaba_news_bahirdar_win-Dck88CQr.jpg",
    "revision": null
  }, {
    "url": "assets/halaba_match_action_1792217992379-BmsC7Yfv.webp",
    "revision": null
  }, {
    "url": "assets/halaba_home_jersey_1792356797619-DTn3NB0B.webp",
    "revision": null
  }, {
    "url": "assets/halaba_away_jersey_1792356797886-CuAyXANL.webp",
    "revision": null
  }, {
    "url": "assets/halaba_academy_training_1792218005519-CP1FyldZ.webp",
    "revision": null
  }, {
    "url": "assets/firestore_prod_jersey-third-2026-DhrS3_as.jpg",
    "revision": null
  }, {
    "url": "assets/firestore_prod_jersey-home-2026-BFuGm9Jf.jpg",
    "revision": null
  }, {
    "url": "assets/firestore_prod_jersey-away-2026-CNqFQz0l.jpg",
    "revision": null
  }, {
    "url": "assets/firestore_news_sxRTmExguBl4NTz4RYjR-DeahbIo_.jpg",
    "revision": null
  }, {
    "url": "favicon.png",
    "revision": "8dbc84e3aa98f96348e5d96a433e2233"
  }, {
    "url": "icon.svg",
    "revision": "587043511e5ab4fa07c8e598cdc9e295"
  }, {
    "url": "pwa-192x192.png",
    "revision": "264e77b19766fcb515ae1d1e91a82362"
  }, {
    "url": "pwa-512x512.png",
    "revision": "37275d80d35e3ceefe877a03afae1f19"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "2be7ed2f3a3d225e5f2dcf126da38f0d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e1b88a5d5e591b983452a2b34416c6db"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api/]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/(?:r2|www)\.thesportsdb\.com\/images\/.*/i, new workbox.CacheFirst({
    "cacheName": "sportsdb-badges-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 120,
      maxAgeSeconds: 5184000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/www\.thesportsdb\.com\/api\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "sportsdb-api-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 604800
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/images\.unsplash\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "unsplash-images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
