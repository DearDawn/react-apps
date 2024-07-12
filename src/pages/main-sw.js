// public/sw.js
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification.body);
  event.notification.close();
  // 处理点击通知的逻辑
});

self.addEventListener('install', event => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

self.addEventListener('push', (event) => {
  console.log('[dodo] ', 'event', event);
  const data = event.data.json();
  const options = {
    body: data.body,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});