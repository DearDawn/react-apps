import * as styles from './index.module.less';
import { Comp } from '../type';
import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

enum EStatus {
  init = 'init',
  shrink = 'shrink',
  expend = 'expend',
}

export const Scale: Comp = ({ style }) => {
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const cloneNodeRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [scale, setScale] = useState([1, 1]);
  const [sx, sy] = scale;
  const [status, setStatus] = useState<EStatus>(EStatus.init);

  const getTranslate = () => {
    const fromRect = fromRef.current.getBoundingClientRect();
    const toRect = toRef.current.getBoundingClientRect();

    const scaleX = fromRect.width / toRect.width;
    const scaleY = fromRect.height / toRect.height;
    const fromCenterX = fromRect.left + fromRect.width / 2;
    const fromCenterY = fromRect.top + fromRect.height / 2;
    const toCenterX = toRect.left + toRect.width / 2;
    const toCenterY = toRect.top + toRect.height / 2;
    const offsetX = fromCenterX - toCenterX;
    const offsetY = fromCenterY - toCenterY;

    return {
      str: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
      scale: [scaleX, scaleY],
    };
  };

  const expandElement = () => {
    setTransform('translate(0, 0) scale(1, 1)');
    setStatus(EStatus.expend);
  };

  const shrinkElement = () => {
    const target = fromRef.current;
    const container = target.parentNode as HTMLDivElement;

    const outTop = target.offsetTop < container.scrollTop;
    const outBottom =
      target.offsetTop > container.scrollTop + container.clientHeight;
    const outLeft = target.offsetLeft < container.scrollLeft;
    const outRight =
      target.offsetLeft > container.scrollLeft + container.clientWidth;

    console.log('[dodo] ', 'outTop', outTop, outBottom, outLeft, outRight);
    if (outTop || outBottom || outLeft || outRight) {
      target.scrollIntoView({ behavior: 'instant' });
    }

    const { str, scale } = getTranslate() || {};
    setTransform(str);
    setScale(scale);
    setStatus(EStatus.shrink);
  };

  useEffect(() => {
    if (fromRef.current && toRef.current) {
      const { str, scale } = getTranslate() || {};
      setTransform(str);
      setScale(scale);
      const newNode = fromRef.current.cloneNode(true) as HTMLDivElement;
      newNode.style.position = 'relative';
      newNode.style.top = '0';
      newNode.style.left = '0';
      newNode.style.bottom = 'unset';
      newNode.style.right = 'unset';
      newNode.style.margin = 'unset';
      newNode.style.transform = 'unset';
      cloneNodeRef.current.appendChild(newNode);
    }
  }, []);

  return (
    <div className={clsx(styles.container, styles[status])}>
      <div
        className={styles.target}
        style={{ opacity: status === EStatus.init ? 1 : 0 }}
        onClick={expandElement}
        ref={fromRef}
      >
        点击我放大
      </div>
      <div
        className={clsx(styles.fullscreenBox, styles[status], {})}
        onClick={shrinkElement}
        ref={toRef}
        style={transform ? { transform } : {}}
      >
        <div
          className={styles.holder}
          ref={cloneNodeRef}
          style={{
            transform: `scale(${sx && 1 / sx},${sy && 1 / sy})`,
          }}
        />
        <div className={styles.content}>放大的div</div>
      </div>
      <div
        className={clsx(styles.fullscreenBoxMask, styles[status], {})}
        onClick={shrinkElement}
        ref={toRef}
      />
    </div>
  );
};

Scale.scale = 0.8;
