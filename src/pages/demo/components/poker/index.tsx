import { Button, Space } from 'sweet-me';
import { Comp } from '../type';
import * as styles from './index.module.less';
import { useRef, useState } from 'react';
import clsx from 'clsx';
import { waitTime } from '@/utils';

type CUT_MODE = 'next' | 'prev';

export const Poker: Comp = ({ style }) => {
  const [cutMode, setCutMode] = useState<CUT_MODE>();
  const lock = useRef(false);

  const [cardList, setCardList] = useState(
    Array.from({ length: 5 }, (_, i) => i + 1)
  );

  const handleCut = (mode: CUT_MODE) => async () => {
    if (lock.current) return;

    lock.current = true;
    setCutMode(mode);
    await waitTime(1000);

    const newList =
      mode === 'next'
        ? [...cardList.slice(1), cardList[0]]
        : [...cardList.slice(-1), ...cardList.slice(0, -1)];
    setCardList(newList);
    setCutMode(undefined);
    lock.current = false;
  };

  console.log('[dodo] ', 'cardList', cardList);

  return (
    <div className={styles.poker} style={style}>
      <div
        className={clsx(styles.cardWrap, {
          [styles.cutNext]: cutMode === 'next',
          [styles.cutPrev]: cutMode === 'prev',
        })}
      >
        {cardList.map((item, idx) => (
          <div
            style={
              {
                '--index': idx + 1,
                '--total': cardList.length,
              } as any
            }
            className={styles.card}
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
      <Space className={styles.options}>
        <Button onClick={handleCut('prev')}>上一张</Button>
        <Button onClick={handleCut('next')}>下一张</Button>
      </Space>
    </div>
  );
};

Poker.scale = 0.5;
