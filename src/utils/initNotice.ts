import { HOST } from './fetch';
import { clientId } from './id';

const reqGrant = () => {
  Notification.requestPermission();
};

if ('Notification' in window) {
  if (Notification.permission !== 'granted') {
    document.addEventListener('touchstart', reqGrant);
  }
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

function connect() {
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

    setTimeout(() => {
      console.log('[dodo] ', '重连中...');
      connect();
    }, 15000);
  };
}

connect();

window.addEventListener('beforeunload', () => {
  document.removeEventListener('touchstart', reqGrant);
});
