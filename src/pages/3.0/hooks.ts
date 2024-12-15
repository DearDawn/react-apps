import { useGLTF } from '@react-three/drei';
import { Camera, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
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
  midPoints = [],
  offset = new THREE.Vector3(0, 1, 0),
  duration = 1000,
  onEnd,
}: {
  camera: Camera;
  target?: THREE.Vector3;
  targetRef?: React.MutableRefObject<THREE.Mesh>;
  midPoints?: THREE.Vector3Like[];
  offset?: THREE.Vector3;
  duration?: number;
  onEnd?: (isFocus: boolean) => void;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [moving, setMoving] = useState(false);
  const [inited, setInited] = useState(false);
  const elapsedTime = useRef(0);
  const onEndRef = useRef(onEnd);
  const initialCameraPos = useRef(camera.position.clone());
  const targetPos =
    targetRef?.current?.getWorldPosition(new THREE.Vector3(0, 0, 0)) || target;
  const targetViewPos = targetPos.clone().add(offset);

  const startFocus = () => {
    setIsFocus(true);
    setMoving(true);
    setInited(true);
  };

  const endFocus = () => {
    setIsFocus(false);
    setMoving(true);
    setInited(true);
  };

  useEffect(() => {
    if (!moving && inited) {
      onEndRef.current?.(isFocus);
    }
  }, [inited, isFocus, moving, onEndRef]);

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

    const lookAtTargetPos = isFocus
      ? new THREE.Vector3().lerpVectors(
          camera.lookAtPoint.clone(),
          targetPos.clone(),
          t
        )
      : new THREE.Vector3().lerpVectors(
          targetPos.clone(),
          camera.lookAtPoint.clone(),
          t
        );

    const from = initialCameraPos.current;
    const to = targetViewPos;

    if (isFocus) {
      if (midPoints.length === 1) {
        camera.position.quadraticBezier(from, midPoints[0], to, t);
      } else {
        camera.position.lerpVectors(from, to, t);
      }
    } else {
      if (midPoints.length === 1) {
        camera.position.quadraticBezier(to, midPoints[0], from, t);
      }
      camera.position.lerpVectors(to, from, t);
    }

    camera.lookAt(lookAtTargetPos);
  });

  return { startFocus, endFocus, isFocus, moving };
};

export const useScreenPosition = (camera) => {
  const startCalc = (target) => {
    // 获取对象的边界框
    const box = new THREE.Box3().setFromObject(target);

    // 获取边界框的中心点和大小
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // 获取边界框的 8 个顶点
    const vertices = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    // 将顶点投影到屏幕坐标
    const screenVertices = vertices.map((vertex) => {
      const projected = vertex.project(camera);
      return {
        x: ((projected.x + 1) / 2) * window.innerWidth,
        y: (-(projected.y - 1) / 2) * window.innerHeight,
      };
    });

    // 计算屏幕上的最小和最大坐标
    const screenMin = { x: Infinity, y: Infinity };
    const screenMax = { x: -Infinity, y: -Infinity };

    screenVertices.forEach((vertex) => {
      screenMin.x = Math.min(screenMin.x, vertex.x);
      screenMin.y = Math.min(screenMin.y, vertex.y);
      screenMax.x = Math.max(screenMax.x, vertex.x);
      screenMax.y = Math.max(screenMax.y, vertex.y);
    });

    console.log('[dodo] ', 'screenVertices', screenVertices);

    // 计算屏幕上的宽度和高度
    const screenWidth = screenMax.x - screenMin.x;
    const screenHeight = screenMax.y - screenMin.y;

    console.log(`屏幕宽度: ${screenWidth}, 屏幕高度: ${screenHeight}`);

    return { screenWidth, screenHeight };
  };

  return { startCalc };
};
