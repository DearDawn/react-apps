import React, { useState, useRef, useEffect } from 'react';
import * as styles from './index.module.less';
import clsx from 'clsx';

interface IProps {
  onInput?: (value: number) => void;
  className?: string;
}

export const RangeSlider = (props: IProps) => {
  const { onInput, className } = props || {};
  const [isDragging, setIsDragging] = useState(false);
  const [value, setValue] = useState(50);
  const sliderRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDragging) {
        const rect = sliderRef.current.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;

        const percent = (offsetX / rect.width) * 100;
        setValue(percent);
        onInput?.(percent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onInput]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div className={clsx(styles.sliderContainer, className)} ref={sliderRef}>
      <div className={styles.sliderTrack}></div>
      <div
        className={styles.sliderThumb}
        ref={thumbRef}
        style={{ left: `${value}%` }}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};
