console.log('[dodo] ', 'self', self);

self.addEventListener('push', event => {
  const title = '通知标题123';
  const options = {
    body: '通知正文',
    icon: '/src/assets/sugar.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('message', event => {
  if (event.data.action === 'notice') {
    // 执行自定义操作
  }
});