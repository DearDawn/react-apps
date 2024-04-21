import { Button } from 'sweet-me';
import * as styles from './index.module.less';
import Image from 'src/assets/bunny.png';
import { Comp } from '../type';
import { useCallback, useState } from 'react';

export const Notice: Comp = ({ style }) => {
  const [badge, setBadge] = useState(0);

  const handleBadge = useCallback(() => {
    const newVal = (badge + 1) % 10;

    Notification.requestPermission().then(() => {
      if (newVal === 0) {
        navigator?.clearAppBadge();
      } else {
        navigator?.setAppBadge(newVal);
      }
    });

    setBadge(newVal);
  }, [badge]);

  const handleClick = () => {
    if ('Notification' in window) {
      alert(Notification?.permission);
    } else {
      alert('不支持');
    }

    Notification.requestPermission()
      .then((result) => {
        alert(`result${result}`);
      })
      .catch((err) => {
        alert(`err${JSON.stringify(err)}`);
      });
  };

  const handleNotice = () => {
    const notice = new Notification('你好呀~ 我是一个通知', {
      body: 'Notification Body',
      icon: Image,
    });

    notice.onshow = () => {
      // alert('show');
    };
    notice.onerror = (err) => {
      console.log('[dodo] ', 'err', err);
      alert(`err${JSON.stringify(err)}`);
    };
  };

  function showNotification() {
    Notification.requestPermission().then((result) => {
      console.log('[dodo] ', 'result', result, navigator.serviceWorker);
      if (result === 'granted') {
        navigator.serviceWorker.ready
          .then((registration) => {
            console.log('[dodo] ', '1111', 1111);
            registration.showNotification('Vibration Sample', {
              body: 'Buzz! Buzz!',
              // icon: "../images/touch/chrome-touch-icon-192x192.png",
              // vibrate: [200, 100, 200, 100, 200, 100, 200],
              // tag: "123",
            });
            setTimeout(() => {
              registration.showNotification('Vibration Sample123', {
                body: 'Buzz! Buzz!',
                // icon: "../images/touch/chrome-touch-icon-192x192.png",
                // vibrate: [200, 100, 200, 100, 200, 100, 200],
                // tag: "123",
              });
            }, 5000);
          })
          .catch((err) => {
            console.log('[dodo] ', 'err', err);
          });
      }
    });
  }

  const handleNoticeSW = () => {
    if ('serviceWorker' in navigator) {
      // navigator.serviceWorker.controller.postMessage({ action: 'notice' });
      showNotification();
    }
  };

  return (
    <div className={styles.card} style={style}>
      <Button onClick={handleClick}>授权</Button>
      <Button onClick={handleNotice}>通知</Button>
      <Button onClick={handleNoticeSW}>SW 通知</Button>
      <Button onClick={handleBadge}>Badge {badge}</Button>
    </div>
  );
};

Notice.scale = 0.8;
