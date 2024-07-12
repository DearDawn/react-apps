import { HOST } from './fetch';

if ('serviceWorker' in navigator) {
  console.log('[dodo] ', '1111 sw', 1111);
  navigator.serviceWorker
    // @ts-expect-error import.meta.url
    .register(new URL('../pages/main-sw.js', import.meta.url))
    .then((registration) => {
      console.log('[dodo] ', '111', 111, registration);
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BOoDOt7RJ7MyrXYhTS5owwU-GksnRX-Qx98CqsvA5xf50x7NqBHtKtd9og3684udW-Ivm0W5UKVlBGTlerYkGXY'
        ),
      });
    })
    .then((subscription) => {
      console.log('Subscription object:', JSON.stringify(subscription));
      // 将 subscription 对象发送到您的 NestJS 服务
      fetch(`${HOST}/web-push/my-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    })
    .catch((error) => {
      console.error('Error subscribing to push notifications:', error);
    });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
