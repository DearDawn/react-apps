import { useCallback, useEffect } from 'react';
import * as styles from './index.module.less';
import { Space, usePageVisible } from 'sweet-me';
import { Comp } from '../type';
import { useFetch } from '@/utils/fetch';
import clsx from 'clsx';

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

export const Lottery: Comp = ({ style, visible }) => {
  const { pageVisible } = usePageVisible();
  const { data, runApi } = useFetch<ILottery>({
    url: '/crawler/lottery',
    autoRun: false,
  });

  const { list = [], updateAt } = data?.data || {};
  const myList = '02 05 17 19 27 01 09'.split(' ');
  const myBefore = myList.slice(0, 5);
  const myEnd = myList.slice(5, 7);
  console.log('[dodo] ', 'myEnd', myEnd);

  const formatResult = useCallback((item: ILotteryItem) => {
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
    console.log('[dodo] ', 'endList', endList);
    endList.forEach((it) => {
      const hit = myEnd.includes(it);
      hitInfo[1] += hit ? 1 : 0;
      showList.push({ number: it, hit, type: 'end' });
    });

    return { showList, hitInfo };
  }, []);

  useEffect(() => {
    if (!visible || !pageVisible) return;

    runApi();
  }, [visible, pageVisible]);

  return (
    <div className={styles.lotteryCard} style={style}>
      <div className={styles.title}>超级大乐透</div>
      <div className={styles.subtitle}>更新时间：{updateAt}</div>
      {/* <div className={styles.subtitle}>购彩时间：{updateAt}</div>
      <div className={styles.subtitle}>剩余期数：{updateAt}</div> */}
      <div className={styles.lotteryList}>
        {list.map((item) => (
          <div className={styles.lotteryItem} key={item.no}>
            <div className={styles.date}>{`${item.date} 第 ${item.no} 期`}</div>
            <div className={styles.ballList}>
              {formatResult(item).showList.map((it) => (
                <div
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
