self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("cache").then((cache) => {
      return cache.addAll([
        "logo.webp",
        "loading.webp",
        "jquery.js"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (["cache"].indexOf(key) === -1) return caches.delete(key);
      }));
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(caches.match(event.request).then(response => {
    if (!response && navigator.onLine === false) return new Response(`<body style="font-family:segoe ui,'Open Sans',sans-serif;background:black;color:white;text-align:center;"><img src="logo.webp" style="position:fixed;top:50%;left:50%;margin-top:-95px;margin-left:-75px;"><p>Server is down, or you are not connected to the internet.</p></body>`,{headers:{"Content-Type":"text/html"}});
    return response ? response : fetch(event.request);
  }));
});