import { useCallback, useEffect, useRef, useState } from 'react';
import * as styles from './index.module.less';
import clsx from 'clsx';
import { useFetch } from '@/utils/fetch';
import DefaultAvatar from '../../game/player-head.png';
import { Button, Image, loading } from 'sweet-me';

interface IProps {
  onClose?: VoidFunction;
  scoreId?: string;
  initRankList?: IRankItem[];
}

type IRankItem = {
  name: string;
  score: number;
  avatar: string;
  date: number;
  ua: string;
  duration: number;
  _id: string;
};

type ITabOption = {
  label: string;
  value: number | string;
};

export const Tabs = (props: {
  options: ITabOption[];
  onChange?: (it: ITabOption) => void;
  activeTab?: string | number;
  className?: string;
  tabClassName?: string;
}) => {
  const { options, onChange, className, tabClassName, activeTab } = props || {};
  const [activeKey, setActiveKey] = useState<string | number>(activeTab);

  const handleClick = (it: ITabOption) => () => {
    onChange?.(it);
    setActiveKey(it.value);
  };

  return (
    <div className={clsx(styles.tabList, className)}>
      {options.map((it) => (
        <div
          className={clsx(styles.tabItem, tabClassName, {
            [styles.active]: activeKey === it.value,
          })}
          key={it.value}
          onClick={handleClick(it)}
        >
          {it.label}
        </div>
      ))}
    </div>
  );
};

export const Rank = (props: IProps) => {
  const { onClose, initRankList = [], scoreId = '' } = props;
  const PAGE_COUNT = 20;
  const [rankList, setRankList] = useState<IRankItem[]>(initRankList);
  const listTemp = useRef<IRankItem[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [tabKey, setTabKey] = useState<string | number>('day');
  const page = useRef(0);

  const { runApi } = useFetch<{ data: IRankItem[] }>({
    url: '/pet/rank_list',
    params: { type: tabKey },
    cache: true,
    loadingFn: () => loading('加载中', 30000, false, 300),
  });

  const loadList = useCallback(() => {
    page.current += 1;
    const total = page.current * PAGE_COUNT;
    const newList = listTemp.current.slice(0, total) || [];
    setRankList(newList);
  }, [page, listTemp]);

  const doRequest = useCallback(() => {
    runApi().then((res) => {
      listTemp.current = res.data;
      loadList();
    });
  }, [runApi, loadList, listTemp]);

  useEffect(() => {
    doRequest();
  }, [doRequest, tabKey]);

  const handleTabChange = useCallback((it: ITabOption) => {
    listRef.current.scrollTo({ top: 0 });
    page.current = 0;
    listTemp.current = [];
    setTabKey(it.value);
    setRankList([]);
  }, []);

  useEffect(() => {
    const holder = holderRef.current;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && listTemp.current.length) {
          loadList();
          if (page.current * PAGE_COUNT >= listTemp.current.length) {
            observer.unobserve(entry.target);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: listRef.current,
      rootMargin: '0px 0px 100px 0px',
    });

    if (holder) {
      observer.observe(holder);
    }

    return () => {
      if (holder) {
        observer.unobserve(holder);
      }
    };
  }, [listTemp, holderRef, listRef, tabKey]);

  return (
    <div className={styles.rank}>
      <Tabs
        options={[
          {
            label: '日榜',
            value: 'day',
          },
          {
            label: '总榜',
            value: 'all',
          },
        ]}
        activeTab={tabKey}
        onChange={handleTabChange}
      />
      <div className={styles.rankList} ref={listRef}>
        {rankList.length === 0 && <div className={styles.rankItem}>虚位以待~</div>}
        {rankList.map((it, idx) => (
          <div
            className={clsx(styles.rankItem, {
              [styles.active]: it._id === scoreId,
            })}
            key={idx}
          >
            <div className={styles.index}>No.{idx + 1}</div>
            <div className={styles.score}>{it.score}</div>
            <div className={styles.name}>{it.name}</div>
            <Image
              className={styles.avatar}
              src={it.avatar || DefaultAvatar}
              lazyLoad
              lazyRoot={listRef.current}
            />
          </div>
        ))}
        <div className={styles.holder} ref={holderRef} />
      </div>
      <Button className={styles.closeBtn} onClick={onClose}>
        关闭
      </Button>
    </div>
  );
};
