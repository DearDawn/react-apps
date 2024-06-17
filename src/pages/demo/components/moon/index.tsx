import { LUNAR_CYCLE_DAYS, getLunarAge } from '@/utils/moon';
import { Comp } from '../type';
import * as styles from './index.module.less';

export const Moon: Comp = () => {
  const lunarAge = getLunarAge();
  const age = LUNAR_CYCLE_DAYS / 2 - lunarAge;
  const ratio = 1 - age / LUNAR_CYCLE_DAYS;

  return <div className={styles.moon} style={{ '--ratio': ratio } as any} />;
};

Moon.scale = 1;
