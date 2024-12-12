import { useGLTF } from '@react-three/drei';
import { Camera, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

useGLTF.setDecoderPath(
  'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/files/draco/'
);

export const useGltfLoader = <T>(inputPath: string) =>
  useGLTF(inputPath, true) as T;

export const useFocus = ({
  camera,
  target = new THREE.Vector3(),
  targetRef,
  offset = new THREE.Vector3(0, 1, 0),
  duration = 1000,
}: {
  camera: Camera;
  target?: THREE.Vector3;
  targetRef?: React.MutableRefObject<THREE.Mesh>;
  offset?: THREE.Vector3;
  duration?: number;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [moving, setMoving] = useState(false);
  const elapsedTime = useRef(0);
  const initialCameraPos = useRef(camera.position.clone());
  const targetPos =
    targetRef?.current?.getWorldPosition(new THREE.Vector3(0, 0, 0)) || target;
  const targetViewPos = targetPos.clone().add(offset);

  const startFocus = () => {
    setIsFocus(true);
    setMoving(true);
  };

  const endFocus = () => {
    setIsFocus(false);
    setMoving(true);
  };

  console.log('[dodo] render', targetPos, camera.lookAtPoint);
  useFrame((_, delta) => {
    if (!moving) return;

    // 累计时间
    elapsedTime.current = delta * 1000 + elapsedTime.current; // 将 delta 转换为毫秒
    // 计算插值因子 t
    const t = Math.min(elapsedTime.current / duration, 1);

    if (t >= 1) {
      elapsedTime.current = 0;
      setMoving(false);
    }

    if (isFocus) {
      camera.position.lerpVectors(initialCameraPos.current, targetViewPos, t);
      camera.lookAt(targetPos);
    } else {
      camera.position.lerpVectors(targetViewPos, initialCameraPos.current, t);
      camera.lookAt(camera.lookAtPoint);
    }
  });

  return { startFocus, endFocus, isFocus, moving };
};
