import { useGLTF } from '@react-three/drei';
import { Camera, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  focusLockRef,
  duration = 1000,
  onStart,
  onEnd,
}: {
  camera: Camera;
  target?: THREE.Vector3;
  targetRef?: React.MutableRefObject<THREE.Mesh>;
  midPoints?: THREE.Vector3Like[];
  offset?: THREE.Vector3;
  focusLockRef?: React.MutableRefObject<string>;
  duration?: number;
  onStart?: (isFocus: boolean) => void;
  onEnd?: (isFocus: boolean) => void;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isDelayFocus, setIsDelayFocus] = useState(false);
  const [moving, setMoving] = useState(false);
  const [initd, setInitd] = useState(false);
  const elapsedTime = useRef(0);
  const onEndRef = useRef(onEnd);
  const initialCameraPos = useRef(camera.position.clone());
  const currentCameraPos = useRef(camera.position.clone());
  const targetPos =
    targetRef?.current?.getWorldPosition(new THREE.Vector3(0, 0, 0)) || target;
  const targetViewPos = targetPos.clone().add(offset);
  const targetId = targetPos.toArray().join(',');

  const startFocus = useCallback(() => {
    focusLockRef.current = targetId;
    setIsFocus(true);
    setMoving(true);
    setInitd(true);
    onStart?.(true);
  }, [focusLockRef, onStart, targetId]);

  const endFocus = useCallback(() => {
    setIsFocus(false);
    setMoving(true);
    setInitd(true);
    onStart?.(false);
  }, [onStart]);

  const toggleFocus = useCallback(
    (e?: ThreeEvent<MouseEvent>) => {
      if (e) {
        e.stopPropagation();
      }

      currentCameraPos.current = camera.position.clone();

      if (isFocus) {
        endFocus();
      } else {
        startFocus();
      }
    },
    [camera.position, endFocus, isFocus, startFocus]
  );

  useEffect(() => {
    if (isFocus) {
      setTimeout(() => setIsDelayFocus(true), duration);
    } else {
      setIsDelayFocus(false);
    }
  }, [duration, focusLockRef, isFocus]);

  useEffect(() => {
    if (!moving && initd) {
      onEndRef.current?.(isFocus);

      if (!isFocus) {
        if (focusLockRef.current === targetId) {
          focusLockRef.current = '';
        }
      }
    }
  }, [focusLockRef, initd, isFocus, moving, onEndRef, targetId]);

  useFrame((_, delta) => {
    if (!moving || focusLockRef.current !== targetId) return;

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
          camera.currentLookAtPoint.clone(),
          targetPos.clone(),
          t
        )
      : new THREE.Vector3().lerpVectors(
          targetPos.clone(),
          camera.lookAtPoint.clone(),
          t
        );

    if (t >= 1) {
      camera.currentLookAtPoint = lookAtTargetPos.clone();
    }

    const from = initialCameraPos.current;
    const current = currentCameraPos.current;
    const to = targetViewPos;
    const firstFocus = currentCameraPos.current.equals(
      initialCameraPos.current
    );

    if (isFocus) {
      if (midPoints.length === 1 && firstFocus) {
        camera.position.quadraticBezier(current, midPoints[0], to, t);
      } else {
        camera.position.lerpVectors(current, to, t);
      }
    } else {
      if (midPoints.length === 1) {
        camera.position.quadraticBezier(to, midPoints[0], from, t);
      } else {
        camera.position.lerpVectors(to, from, t);
      }
    }

    camera.lookAt(lookAtTargetPos);
  });

  return { startFocus, endFocus, toggleFocus, isFocus, isDelayFocus, moving };
};

export const useScreenPosition = ({
  meshRef,
  widthScale = 1,
  heightScale = 1,
}) => {
  const { camera, size } = useThree();

  const startCalc = useCallback(() => {
    if (meshRef.current) {
      // 获取物体的包围盒
      const boundingBox = new THREE.Box3().setFromObject(meshRef.current);

      // 获取包围盒的中心点
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      // 将中心点投影到屏幕上
      const screenPosition = center.project(camera);

      // 将 NDC 坐标转换为屏幕坐标
      const x = (screenPosition.x * 0.5 + 0.5) * size.width;
      const y = (screenPosition.y * -0.5 + 0.5) * size.height;

      // 获取包围盒的 8 个顶点
      const min = boundingBox.min;
      const max = boundingBox.max;
      const vertices = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, max.y, max.z),
      ];

      // 将每个顶点投影到屏幕上
      const screenVertices = vertices.map((vertex) => {
        const screenVertex = vertex.project(camera);
        return {
          x: (screenVertex.x * 0.5 + 0.5) * size.width,
          y: (screenVertex.y * -0.5 + 0.5) * size.height,
        };
      });

      // 计算屏幕上的最小值和最大值
      const minX = Math.min(...screenVertices.map((v) => v.x));
      const maxX = Math.max(...screenVertices.map((v) => v.x));
      const minY = Math.min(...screenVertices.map((v) => v.y));
      const maxY = Math.max(...screenVertices.map((v) => v.y));

      // 计算包围盒在屏幕上的宽度和高度
      const screenWidth = (maxX - minX) * widthScale;
      const screenHeight = (maxY - minY) * heightScale;

      return { x, y, screenWidth, screenHeight };
    }
  }, [camera, heightScale, meshRef, size.height, size.width, widthScale]);

  return { startCalc };
};
