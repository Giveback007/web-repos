// https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW
module.exports = {
    "globDirectory": "dist/",
    "globPatterns": [
      "**/*.{html,js,css,png,jpg,jpeg,svg,gif,ico,json,woff,woff2,eot,webmanifest,map}"
    ],
    "swDest": "dist/sw.js",
    "maximumFileSizeToCacheInBytes": 10000000,
    runtimeCaching: [{
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: { cacheName: "images" }
    }],
    skipWaiting: true,
    // navigateFallback
};
