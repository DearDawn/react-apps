import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useScreenPosition } from '../../hooks';

export const MyHtml = ({
  targetRef,
  visible,
  widthScale = 1,
  heightScale = 1,
  delayLoad = 1500,
  borderRadius = '60px',
  src = 'https://dododawn.com/',
  onClose, // 新增 onClose prop
}) => {
  const bodyRef = useRef(document.body);
  const htmlDomRef = useRef<HTMLDivElement>(null);
  const { startCalc } = useScreenPosition({
    meshRef: targetRef,
    widthScale,
    heightScale,
  });
  const [screenSize, setScreenSize] = useState([1, 1]);
  const [selfVisible, setSelfVisible] = useState(false);
  const [load, setLoad] = useState(false);
  const isVertical = screenSize[0] < screenSize[1];
  const HTML_WIDTH = isVertical ? 375 : 1440;

  useEffect(() => {
    if (visible && htmlDomRef.current) {
      setTimeout(() => {
        const { screenWidth, screenHeight, x, y } = startCalc();
        setScreenSize([screenWidth, screenHeight]);
        htmlDomRef.current.parentElement.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(1)`;
        setSelfVisible(true);
      }, 100);
    } else {
      setSelfVisible(false);
    }
  }, [startCalc, visible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoad(true);
    }, delayLoad);

    return () => {
      clearTimeout(timer);
    };
  }, [delayLoad]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (visible) {
        const htmlElement = document.querySelector('iframe');
        if (htmlElement && !htmlElement.contains(event.target)) {
          onClose?.();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [visible, onClose]);

  return (
    <Html
      ref={htmlDomRef}
      style={{
        transform: `translate(-50%, -50%) scale(${screenSize[0] / HTML_WIDTH}`,
        pointerEvents: visible ? 'auto' : 'none',
        background: 'transparent',
      }}
      onClick={(e) => e.stopPropagation()}
      castShadow
      receiveShadow
      // occlude='blending'
      visible
      portal={bodyRef}
    >
      {load && (
        <iframe
          src={src}
          style={{
            width: `${HTML_WIDTH}px`,
            height: `${(screenSize[1] / screenSize[0]) * HTML_WIDTH}px`,
            borderRadius,
            display: 'block',
            boxSizing: 'border-box',
            background: 'transparent',
            transition: visible
              ? 'opacity 0.2s 0.4s linear'
              : 'opacity 0s linear',
            opacity: selfVisible ? 1 : 0,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        ></iframe>
      )}
    </Html>
  );
};
