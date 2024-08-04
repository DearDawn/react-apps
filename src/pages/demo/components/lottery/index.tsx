import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as styles from './index.module.less';
import { Space, Storage, loading, usePageVisible } from 'sweet-me';
import { Comp } from '../type';
import { useFetch } from '@/utils/fetch';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { getWinRules } from './utils';

const storage = new Storage();

type ILotteryItem = {
  date: string;
  no: string;
  result: string;
};
type ILottery = {
  data: {
    list: ILotteryItem[];
    updateAt: string;
  };
};

storage.config({ namespace: 'lottery-list', sync: false });

const MY_NUMBER_KEY = 'my_number';
const MY_DATE_KEY = 'my_date';

const MY_NUMBER_DEFAULT = '02 05 17 19 27 01 09';
const MY_DATE_DEFAULT = dayjs('2024-07-31').format('YYYY-MM-DD');

export const Lottery: Comp = ({ style, visible }) => {
  const { pageVisible } = usePageVisible();
  const rootRef = useRef(null);
  const [myNumber, setMyNumber] = useState<string>(
    storage.get(MY_NUMBER_KEY) || MY_NUMBER_DEFAULT
  );
  const [myDate, setMyDate] = useState(
    storage.get(MY_DATE_KEY) || MY_DATE_DEFAULT
  );
  const { data, runApi } = useFetch<ILottery>({
    url: '/crawler/lottery',
    autoRun: false,
    loadingFn: () =>
      loading('数据加载中...', undefined, false, 300, rootRef.current),
  });

  const { list: sourceList = [], updateAt } = data?.data || {};
  const myList = myNumber.split(' ');
  const myBefore = myList.slice(0, 5);
  const myEnd = myList.slice(5, 7);

  const leftTime = useMemo(() => {
    const lastRecord = sourceList.findIndex((it) => it.date <= myDate);

    if (lastRecord > -1) {
      return 20 - lastRecord - 1;
    }
  }, [sourceList, myDate]);

  const formatList = useMemo(() => {
    return sourceList.map((item) => {
      const list = item.result.split(' ');
      const beforeList = list.slice(0, 5);
      const endList = list.slice(5, 7);

      const hitInfo = [0, 0];
      const showList: { number: string; hit: boolean; type: string }[] = [];

      beforeList.forEach((it) => {
        const hit = myBefore.includes(it);
        hitInfo[0] += hit ? 1 : 0;
        showList.push({ number: it, hit, type: 'before' });
      });
      endList.forEach((it) => {
        const hit = myEnd.includes(it);
        hitInfo[1] += hit ? 1 : 0;
        showList.push({ number: it, hit, type: 'end' });
      });

      return { ...item, showList, rule: getWinRules(...hitInfo) };
    });
  }, [sourceList, myBefore, myEnd]);

  useEffect(() => {
    if (!visible || !pageVisible) return;

    runApi();
  }, [visible, pageVisible]);

  return (
    <div className={styles.lotteryCard} style={style} ref={rootRef}>
      <div className={styles.title}>超级大乐透</div>
      <div className={styles.subtitle}>更新时间：{updateAt}</div>
      <div className={styles.myInfo}>
        <div className={styles.number}>
          我的号码：
          <div className={styles.myList}>
            {myBefore.map((it) => (
              <div className={styles.before} key={`before-${it}`}>
                {it}
              </div>
            ))}
            {myEnd.map((it) => (
              <div className={styles.end} key={`end-${it}`}>
                {it}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.date}>
          <span>购彩时间：{myDate}</span>
          <span>剩余期数：{leftTime}</span>
        </div>
      </div>

      <div className={styles.lotteryList}>
        {formatList.map((item) => (
          <div className={styles.lotteryItem} key={item.no}>
            <div className={styles.date}>
              <span>{`${item.date} 第 ${item.no} 期`}</span>
              {item.rule.level > 0 && (
                <span className={styles.win}>
                  {item.rule.levelText}&nbsp;
                  {item.rule.reward}
                </span>
              )}
            </div>
            <div className={styles.ballList}>
              {item.showList.map((it) => (
                <div
                  key={`${item.no}-${it.number}-${it.type}`}
                  className={clsx(styles.ballItem, {
                    [styles.hit]: it.hit,
                    [styles.end]: it.type === 'end',
                  })}
                >
                  {it.number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Lottery.scale = 0.5;
Lottery.fitHeight = true;
