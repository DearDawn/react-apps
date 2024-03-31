self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('my-cache').then(function (cache) {
      return cache.addAll(['./index.html']);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', function (event) {
  var payload = event.data ? event.data.text() : 'Default notification';

  event.waitUntil(
    self.registration.showNotification('Notification Title', {
      body: payload,
      icon: '/path/to/notification-icon.png'
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // 执行你的自定义操作，例如打开特定的URL
  // event.waitUntil(
  //   clients.openWindow('https://example.com')
  // );
});