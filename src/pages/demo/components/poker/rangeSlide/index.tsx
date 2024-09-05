import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as styles from './index.module.less';
import clsx from 'clsx';

interface IProps {
  onInput?: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
}

export const RangeSlider = (props: IProps) => {
  const {
    onInput,
    className,
    step = 1,
    min = 0,
    max = 100,
    value = 50,
  } = props || {};
  const [percent, setPercent] = useState(((value - min) / (max - min)) * 100);
  const sliderRef = useRef(null);
  const thumbRef = useRef(null);
  const isDragging = useRef(false);

  const setVal = useCallback(
    (offsetX, rectWidth) => {
      const realVal = ((offsetX / rectWidth) * (max - min) + min);
      const formatVal = Math.round(realVal - (realVal % step));
      const percent = ((formatVal - min) / (max - min)) * 100;

      setPercent(percent);
      onInput?.(formatVal);
    },
    [max, min, onInput, step]
  );

  useEffect(() => {
    const root = sliderRef.current;

    if (!root) return;

    const handleMouseMove = (event) => {
      if (isDragging.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        setVal(offsetX, rect.width);
      }
    };

    const handleTouchMove = (event) => {
      if (isDragging.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        let offsetX = event.touches[0].clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        setVal(offsetX, rect.width);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    root.addEventListener('mousemove', handleMouseMove);
    root.addEventListener('mouseup', handleMouseUp);
    root.addEventListener('touchmove', handleTouchMove);
    root.addEventListener('touchend', handleTouchEnd);
    root.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      root.removeEventListener('mousemove', handleMouseMove);
      root.removeEventListener('mouseup', handleMouseUp);
      root.removeEventListener('touchmove', handleTouchMove);
      root.removeEventListener('touchend', handleTouchEnd);
      root.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onInput, setPercent, setVal]);

  useEffect(() => {
    setPercent(((value - min) / (max - min)) * 100);
  }, [max, min, value]);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleTouchStart = () => {
    isDragging.current = true;
  };

  const handleClick = (event) => {
    const rect = sliderRef.current.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    setVal(offsetX, rect.width);
  };

  return (
    <div
      className={clsx(styles.sliderContainer, className)}
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <div className={styles.sliderTrack}></div>
      <div
        className={styles.sliderThumb}
        ref={thumbRef}
        style={{ left: `${percent}%` }}
      ></div>
    </div>
  );
};
