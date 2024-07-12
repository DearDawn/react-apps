import { HOST } from './fetch';

if ('Notification' in window) {
  Notification.requestPermission();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      // @ts-expect-error import.meta.url
      .register(new URL('../pages/main-sw.js', import.meta.url))
      .then((registration) => {
        console.log(
          'Service Worker registered with scope:',
          registration.scope
        );
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// 生成一个随机的 clientId
const generateRandomId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const clientId = generateRandomId();
const eventSource = new EventSource(`${HOST}/notice/${clientId}`);

eventSource.onmessage = function (event) {
  console.log('Message from server:', event);
  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification('New Message', {
      body: event.data,
    });
  });
};

eventSource.onerror = function (err) {
  console.error('EventSource failed:', err);
};
