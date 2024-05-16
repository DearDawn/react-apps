import * as styles from './index.module.less';
import { Comp } from '../type';
import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useScaleCard } from './hooks';
import { createPortal } from 'react-dom';

const ScaleCore: Comp<{
  fromRef: React.MutableRefObject<HTMLDivElement>;
  onClose: VoidFunction;
  children?:
    | ReactElement
    | ((props: { onClose: VoidFunction }) => ReactElement);
}> = ({ fromRef, children, onClose }) => {
  const toRef = useRef<HTMLDivElement>(null);
  const cloneNodeRef = useRef<HTMLDivElement>(null);
  const showed = useRef(false);
  const { transform, scale, status, show, close } = useScaleCard({
    fromRef,
    toRef,
    cloneNodeRef,
  });
  const [sx, sy] = scale;

  const handleClose = async () => {
    await close();
    onClose();
  };

  useEffect(() => {
    if (fromRef.current && toRef.current && transform && !showed.current) {
      setTimeout(() => {
        showed.current = true;
        show();
      }, 300);
    }
  }, [fromRef, show, transform]);

  // 使用React.cloneElement克隆children组件并添加新的props
  const modifiedChildren =
    typeof children === 'function'
      ? children({ onClose: handleClose })
      : React.cloneElement(children, { onClose: handleClose });

  return (
    <>
      <div
        className={clsx(styles.fullscreenBox, styles[status], {
          [styles.ready]: transform,
        })}
        onClick={handleClose}
        ref={toRef}
        style={{ transform }}
      >
        <div
          className={styles.holder}
          ref={cloneNodeRef}
          style={{
            transform: `scale(${sx && 1 / sx},${sy && 1 / sy})`,
          }}
        />

        <div className={styles.content}>{modifiedChildren}</div>
      </div>
      <div
        className={clsx(styles.fullscreenBoxMask, styles[status], {})}
        onClick={handleClose}
      />
    </>
  );
};

export const ScaleWrap: Comp<{
  fromRef: React.MutableRefObject<HTMLDivElement>;
  root: Element | React.MutableRefObject<HTMLDivElement>;
  children?:
    | ReactElement
    | ((props: { onClose: VoidFunction }) => ReactElement);
}> = ({ fromRef, root, children, ...rest }) => {
  const [scaleRoot, setScaleRoot] = useState<Element>(null);
  const [mount, setMount] = useState(false);

  const handleClose = useCallback(() => {
    setMount(false);
  }, []);

  useEffect(() => {
    if (!fromRef.current) return;

    const fromDom = fromRef.current;

    const cb = async () => {
      setTimeout(() => {
        setMount(true);
      }, 150);
    };

    fromDom.addEventListener('click', cb);

    return () => {
      fromDom.removeEventListener('click', cb);
    };
  }, [fromRef]);

  useEffect(() => {
    if (root instanceof Element) {
      setScaleRoot(root);
    } else {
      setScaleRoot(root?.current);
    }
  }, [root]);

  if (!scaleRoot || !mount) return null;

  return createPortal(
    <ScaleCore fromRef={fromRef} onClose={handleClose} {...rest}>
      {children}
    </ScaleCore>,
    scaleRoot
  );
};

export const Scale: Comp = ({ parent, ...rest }) => {
  const fromRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className={styles.target} ref={fromRef}>
        点击我放大
      </div>
      <ScaleWrap fromRef={fromRef} root={parent} {...rest}>
        {({ onClose = () => {} }) => <div onClick={onClose}>放大的div</div>}
      </ScaleWrap>
    </>
  );
};
