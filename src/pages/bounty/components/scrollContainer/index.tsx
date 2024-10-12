import React, { useEffect, useRef, useState } from 'react';
import * as styles from './index.module.less';
import clsx from 'clsx';
import { CommonProps } from '@/types';

interface IProps extends CommonProps {
  /** 是否启用下拉刷新 */
  enablePullDownRefresh?: boolean;
  /** 是否启用触底加载更多 */
  enableLoadMore?: boolean;
  /** 触底阈值, 默认 200, 单位px */
  loadMoreThreshold?: number;
  children?: any;
  /** 没有更多时的占位符, 默认不显示 */
  noMoreHolder?: boolean;
  /** 加载更多数据的方法 */
  onLoadMore?: () => Promise<{ hasMore?: boolean }>;
  /** 下拉刷新数据的方法 */
  onPullDownRefresh?: () => Promise<any>;
}

export const ScrollContainer = (props: IProps) => {
  const {
    enablePullDownRefresh = true,
    enableLoadMore = true,
    loadMoreThreshold = 200,
    children,
    noMoreHolder = true,
    className,
    onLoadMore,
    onPullDownRefresh,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [listHidden, setListHidden] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const topLoaderRef = useRef<HTMLDivElement>(null);
  const bottomLoaderRef = useRef<HTMLDivElement>(null);
  const touchData = useRef({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    distanceY: 0,
    distanceX: 0,
    realY: 0,
  });

  const DISTANCE_Y_MIN_LIMIT = 35 * window.devicePixelRatio;
  const Y_FACTOR = 20;
  const DEG_LIMIT = 40;

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isLoading || isPulling || !enablePullDownRefresh) return;

    touchData.current.startY =
      'touches' in e ? e.touches[0].clientY : e.clientY;
    touchData.current.startX =
      'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (isLoading || isPulling || !enablePullDownRefresh) return;
    touchData.current.endY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchData.current.endX = 'touches' in e ? e.touches[0].clientX : e.clientX;

    if (listRef.current!.scrollTop > 0) {
      [touchData.current.startY, touchData.current.startX] = [
        touchData.current.endY,
        touchData.current.endX,
      ];
      touchData.current.realY = 0;
      return;
    }

    touchData.current.distanceY =
      touchData.current.endY - touchData.current.startY;
    touchData.current.distanceX =
      touchData.current.endX - touchData.current.startX;

    const deg =
      Math.atan(
        Math.abs(touchData.current.distanceX) / touchData.current.distanceY
      ) *
      (180 / Math.PI);
    if (deg > DEG_LIMIT) {
      [touchData.current.startY, touchData.current.startX] = [
        touchData.current.endY,
        touchData.current.endX,
      ];
      return;
    }
    touchData.current.realY = Math.max(
      Math.log(
        touchData.current.distanceY / Y_FACTOR / window.devicePixelRatio + 1
      ) *
        Y_FACTOR *
        window.devicePixelRatio,
      0
    );

    if (touchData.current.realY > 0) {
      setListHidden(true);
    }

    boxRef.current!.style.transform = `translateY(${touchData.current.realY}px)`;
    boxRef.current!.style.transition = 'all 0s linear';
  };

  const handleEnd = () => {
    if (isLoading || isPulling || !enablePullDownRefresh) return;
    if (touchData.current.endY - touchData.current.startY < 0) return;
    if (touchData.current.realY < DISTANCE_Y_MIN_LIMIT) {
      boxRef.current!.style.transform = 'translateY(0px)';
      boxRef.current!.style.transition = 'all 0.3s linear';
      setListHidden(false);
      return;
    }

    setIsPulling(true);
    boxRef.current!.style.transform = `translateY(${DISTANCE_Y_MIN_LIMIT}px)`;
    boxRef.current!.style.transition = 'all 0.3s linear';
    setIsRefreshing(true);

    if (!onLoadMore) {
      console.error('未配置 onPullDownRefresh 方法');
      return;
    }

    onPullDownRefresh?.().finally(() => {
      setIsPulling(false);
      boxRef.current!.style.transform = 'translateY(0px)';
      boxRef.current!.style.transition = 'all 0.3s linear';
      setIsRefreshing(false);
      setListHidden(false);
      setHasMore(true);
    });
  };

  useEffect(() => {
    if (!enableLoadMore || isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!onLoadMore) {
              console.error('未配置 onLoadMore 方法');
              return;
            }

            setIsLoading(true);
            onLoadMore()
              .then(({ hasMore }) => {
                setHasMore(hasMore);
              })
              .finally(() => {
                setIsLoading(false);
              });
          }
        });
      },
      {
        root: listRef.current,
        rootMargin: `0px 0px ${loadMoreThreshold}px 0px`,
      }
    );

    if (bottomLoaderRef.current) {
      observer.observe(bottomLoaderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [enableLoadMore, hasMore, isLoading, loadMoreThreshold, onLoadMore]);

  return (
    <div
      className={clsx(styles.scrollContainer, {}, className)}
      style={{ '--top-loading-height': `${DISTANCE_Y_MIN_LIMIT}px` } as any}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
    >
      <div className={styles.innerWrap} ref={boxRef}>
        {enablePullDownRefresh && (
          <div ref={topLoaderRef} className={styles.topLoader}>
            <div
              className={clsx(styles.loader, {
                [styles.loading]: isRefreshing,
              })}
            ></div>
          </div>
        )}
        <div
          ref={listRef}
          className={clsx(styles.list, { [styles.hidden]: listHidden })}
        >
          {children}
          {enableLoadMore && hasMore && (
            <div ref={bottomLoaderRef} className={styles.bottomLoader}>
              <div
                className={clsx(styles.loader, { [styles.loading]: true })}
              ></div>
            </div>
          )}
          {!hasMore && noMoreHolder && (
            <div className={styles.noMoreHolder}>没有更多了</div>
          )}
        </div>
      </div>
    </div>
  );
};
