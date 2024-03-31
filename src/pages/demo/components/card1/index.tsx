import { Button } from 'sweet-me';
import * as styles from './index.module.less';
import Image from 'src/assets/bunny.png';

export const Card1 = () => {
  const handleClick = () => {
    if ('Notification' in window) {
      alert(Notification?.permission);
    } else {
      alert('不支持');
    }

    Notification.requestPermission().then((result) => {
      alert(`result${result}`);
    }).catch(err => {
      alert(`err${JSON.stringify(err)}`);
    });
  };

  const handleNotice = () => {
    const notice = new Notification("你好呀~ 我是一个通知", {
      body: 'Notification Body',
      icon: Image
    });

    notice.onshow = () => {
      // alert('show');
    };
    notice.onerror = (err) => {
      console.log('[dodo] ', 'err', err);
      alert(`err${JSON.stringify(err)}`);
    };
  };

  return (
    <div className={styles.card}>
      <Button onClick={handleClick}>授权</Button>
      <Button onClick={handleNotice}>通知</Button>
    </div>
  );
};