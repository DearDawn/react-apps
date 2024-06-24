import { waitTime } from '@/utils';
import React, { useCallback, useEffect, useState } from 'react';

export enum EStatus {
  init = 'init',
  shrink = 'shrink',
  expend = 'expend',
}

export const useScaleCard = (config: {
  fromRef: React.MutableRefObject<HTMLDivElement>;
  toRef: React.MutableRefObject<HTMLDivElement>;
  cloneNodeRef?: React.MutableRefObject<HTMLDivElement>;
  mount?: boolean;
}) => {
  const { fromRef, toRef, cloneNodeRef, mount } = config || {};
  const [transform, setTransform] = useState('');
  const [scale, setScale] = useState([1, 1]);
  const [status, setStatus] = useState<EStatus>(EStatus.init);

  const getTranslate = useCallback(() => {
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
  }, [fromRef, toRef]);

  const show = useCallback(() => {
    setTransform('translate(0, 0) scale(1, 1)');
    setStatus(EStatus.expend);
    fromRef.current.style.opacity = '0';
    cloneNodeRef.current.style.opacity = '1';
  }, [fromRef, cloneNodeRef]);

  const close = async () => {
    const target = fromRef.current;
    const container = target.parentNode as HTMLDivElement;

    const outTop = target.offsetTop < container.scrollTop;
    const outBottom =
      target.offsetTop > container.scrollTop + container.clientHeight;
    const outLeft = target.offsetLeft < container.scrollLeft;
    const outRight =
      target.offsetLeft > container.scrollLeft + container.clientWidth;

    if (outTop || outBottom || outLeft || outRight) {
      target.scrollIntoView({ behavior: 'instant' });
    }

    const { str, scale } = getTranslate() || {};
    setTransform(str);
    setScale(scale);
    setStatus(EStatus.shrink);
    fromRef.current.style.opacity = '0';
    await waitTime(400);
    setStatus(EStatus.init);
    fromRef.current.style.opacity = '1';
    await waitTime(100);
    cloneNodeRef.current.style.opacity = '0';
  };

  useEffect(() => {
    if (fromRef.current && toRef.current) {
      const fromRect = fromRef.current.getBoundingClientRect();
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
      newNode.style.width = `${fromRect.width}px`;
      newNode.style.height = `${fromRect.height}px`;
      cloneNodeRef?.current?.appendChild(newNode);
      fromRef.current.style.opacity = '1';
    }
  }, [cloneNodeRef, fromRef, getTranslate, mount, toRef]);

  return { show, close, transform, scale, status };
};
