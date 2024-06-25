import * as styles from './index.module.less';
import { Comp } from '../type';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import { useScaleCard } from './hooks';
import { createPortal } from 'react-dom';

const InstanceSet = [];

const ScaleCore: Comp<{
  fromRef: React.MutableRefObject<HTMLDivElement>;
  onClose: VoidFunction;
  /** 延迟执行，适用于有 hover 动画的情况 */
  delay?: number;
  children?:
    | ReactElement
    | ((props: { onClose: VoidFunction }) => ReactElement);
}> = ({ fromRef, children, onClose, delay = 100 }) => {
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
    if (!fromRef.current) return;

    const fromDom = fromRef.current;

    const cb = () => {
      setTimeout(() => {
        show();
      }, delay);
    };

    fromDom.addEventListener('click', cb);

    return () => {
      fromDom.removeEventListener('click', cb);
    };
  }, [delay, fromRef, show]);

  useEffect(() => {
    if (fromRef.current && toRef.current && transform && !showed.current) {
      setTimeout(() => {
        showed.current = true;
        show();
      }, delay);
    }
  }, [delay, fromRef, show, transform]);

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
  unmountDestroy?: boolean;
  /** 延迟执行，适用于有 hover 动画的情况 */
  delay?: number;
  children?:
    | ReactElement
    | ((props: { onClose: VoidFunction }) => ReactElement);
}> = ({ fromRef, root, children, delay = 100, unmountDestroy, ...rest }) => {
  const [scaleRoot, setScaleRoot] = useState<Element>(null);
  const [mount, setMount] = useState(false);

  const unmount = useCallback(() => {
    setMount(false);
  }, []);

  const handleClose = useCallback(() => {
    if (unmountDestroy) {
      unmount();
    }
  }, [unmountDestroy, unmount]);

  useEffect(() => {
    if (!fromRef.current) return;

    const fromDom = fromRef.current;

    const cb = async () => {
      setTimeout(() => {
        setMount(true);
      }, delay);
    };

    fromDom.addEventListener('click', cb);

    return () => {
      fromDom.removeEventListener('click', cb);
    };
  }, [delay, fromRef]);

  useEffect(() => {
    if (root instanceof Element) {
      setScaleRoot(root);
    } else {
      setScaleRoot(root?.current);
    }
  }, [root]);

  useEffect(() => {
    if (!InstanceSet.find(unmount)) {
      InstanceSet.push(unmount);

      if (InstanceSet.length > 3) {
        InstanceSet.pop()();
      }
    }
  }, [unmount]);

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
      <ScaleWrap fromRef={fromRef} delay={300} root={parent} {...rest}>
        {({ onClose = () => {} }) => <div onClick={onClose}>放大的div</div>}
      </ScaleWrap>
    </>
  );
};
