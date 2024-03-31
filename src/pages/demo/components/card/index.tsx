import * as styles from './index.module.less';

export const Card = () => {
  return (
    <div className={styles.card}>
      <div className={styles.text}>我是一个泡泡</div>
      <div className={styles.bubbleLight} />
      <div className={styles.bubbleLight2} />
      <div className={styles.wave1} />
      <div className={styles.wave2} />
    </div>
  );
};

Card.scale = 1;