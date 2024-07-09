import { LUNAR_CYCLE_DAYS, getLunarAge } from '@/utils/moon';
import { Comp } from '../type';
import * as styles from './index.module.less';

export const Moon: Comp = () => {
  const lunarAge = getLunarAge();
  const age = LUNAR_CYCLE_DAYS / 2 - lunarAge;
  const ratio =
    age > 0 ? 1 - age / LUNAR_CYCLE_DAYS : 1 + age / LUNAR_CYCLE_DAYS;

  return (
    <div className={styles.moonWrap}>
      <div className={styles.moon} style={{ '--ratio': ratio } as any} />
      <div className={styles.info}>
        <span>月龄：{lunarAge.toFixed(2)} 天</span>
        <a href='https://starwalk.space/zh-Hant/moon-calendar' target='_blank'>
          参考
        </a>
      </div>
    </div>
  );
};

Moon.scale = 1;
