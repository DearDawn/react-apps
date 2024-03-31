import { Button } from 'sweet-me';
import * as styles from './index.module.less';

export const Card1 = () => {
  const handleClick = () => {
    Notification.requestPermission().then((result) => {
      alert(`result${result}`);
    }).catch(err => {
      alert(`err${JSON.stringify(err)}`);
    });
  };

  const handleNotice = () => {
    const notice = new Notification("你好呀~ 我是一个通知");
    notice.onshow = () => {
      alert('show');
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