// 1. Save the files to the user's device
// The "install" event is called when the ServiceWorker starts up.
// All ServiceWorker code must be inside events.
self.addEventListener('install', function(e) {
    console.log('install');

    // waitUntil tells the browser that the install event is not finished until we have
    // cached all of our files
    e.waitUntil(
        // Here we call our cache "myonsenuipwa", but you can name it anything unique
        caches.open('chihuahua-moment').then(cache => {
            // If the request for any of these resources fails, _none_ of the resources will be
            // added to the cache.
            return cache.addAll([
                '/chihuahua/',
                '/chihuahua/index.html',
                '/chihuahua/manifest.json',
                '/chihuahua/styles.css',
                '/chihuahua/app.js',
                'https://unpkg.com/onsenui@2.10.10/css/onsenui.min.css',
                'https://unpkg.com/onsenui@2.10.10/css/onsen-css-components.min.css',
                'https://cdn.plyr.io/3.5.6/plyr.css',
                'https://unpkg.com/onsenui@2.10.10/js/onsenui.min.js',
                'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
                'https://cdn.plyr.io/3.5.6/plyr.js',
                '/chihuahua/favicon.ico'
            ]);
        })
    );
});

// 2. Intercept requests and return the cached version instead
self.addEventListener('fetch', function(e) {
    e.respondWith(
        // check if this file exists in the cache
        caches.match(e.request)
        // Return the cached file, or else try to get it from the server
            .then(response => response || fetch(e.request))
    );
});
