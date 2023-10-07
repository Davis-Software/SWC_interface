const cacheName = "swc-interface-cache-v1"

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll([
            "/static/pwa/offline.html",
            "/favicon",
            "/static/css/bootstrap/bootstrap-swc_interface.css",
            "/static/css/base_styles/base_style.css",
            "/static/css/base_styles/base_md_styles.css",
            "/static/font/material_icons/material_icons.css",
            "/static/js/jquery/jquery.min.js",
            "/static/js/popper/popper.min.js",
            "/static/js/bootstrap/bootstrap.min.js"
        ]))
    )
    console.info('[SW] Service worker installed')
})

self.addEventListener('fetch', event => {
    if(!navigator.onLine){
        event.respondWith(
            ["js", "css"].includes(event.request.url.split('.').pop()) ?
                caches.match(event.request).then(response => response || caches.match("/static/pwa/offline.html")) :
                caches.match("/static/pwa/offline.html")
        )
    }
})