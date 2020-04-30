self.addEventListener("install", function(event) {
  //console.log("Update " + Math.random().toString());
  event.waitUntil(
    caches.open("1").then((cache) => {
      return cache.addAll([
        "logo.webp",
        "wallpaper.webp",
        "loading.webp",
        "jquery.js",
        "close.svg", "max.svg", "min.svg",
        "https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFWJ0bbck.woff2",
        "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css"
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (["1"].indexOf(key) === -1) {
          return caches.delete(key);
        }
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