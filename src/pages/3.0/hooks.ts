import { useGLTF } from '@react-three/drei';
import { Camera, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameContext } from './components/scene';
import { notice } from 'sweet-me';

useGLTF.setDecoderPath(
  'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/files/draco/'
);

export const useGltfLoader = <T>(inputPath: string) =>
  useGLTF(inputPath, true) as T;

export const useFocus = ({
  camera,
  targetRef,
  midPoints: propsMidPoints,
  midPointsOffset = [],
  offset = new THREE.Vector3(0, 1, 0),
  duration = 800,
  onStart,
  onEnd,
}: {
  camera: Camera;
  target?: THREE.Vector3;
  targetRef?: React.MutableRefObject<THREE.Mesh | THREE.Group>;
  midPoints?: THREE.Vector3Like[];
  midPointsOffset?: THREE.Vector3Like[];
  offset?: THREE.Vector3;
  duration?: number;
  onStart?: (isFocus: boolean) => void;
  onEnd?: (isFocus: boolean) => void;
}) => {
  const { sceneReady, currentFocus, currentFocusRef, changeCurrentFocus } =
    useContext(GameContext);
  const [isFocus, setIsFocus] = useState(false);
  const [isDelayFocus, setIsDelayFocus] = useState(false);
  const [moving, setMoving] = useState(false);
  const [initd, setInitd] = useState(false);
  const elapsedTime = useRef(0);
  const onEndRef = useRef(onEnd);
  const initialCameraPos = useRef(camera.position.clone());
  const currentCameraPos = useRef(camera.position.clone());
  const [targetPos, setTargetPos] = useState(
    targetRef?.current?.getWorldPosition(new THREE.Vector3(0, 0, 0)) ||
      new THREE.Vector3(0, 0, 0)
  );
  const midPoints =
    propsMidPoints ||
    midPointsOffset.map((offset) => {
      const pos = new THREE.Vector3(
        Number.isFinite(offset.x) ? targetPos.x + offset.x : 0,
        Number.isFinite(offset.y) ? targetPos.y + offset.y : 0,
        Number.isFinite(offset.z) ? targetPos.z + offset.z : 0
      );
      return pos;
    });

  const targetViewPos = targetPos.clone().add(offset);
  const targetId = targetPos.toArray().join(',');

  const startFocus = useCallback(() => {
    changeCurrentFocus(targetId);
    setIsFocus(true);
    setMoving(true);
    setInitd(true);
    onStart?.(true);
    notice.info(targetRef.current.name, duration);
  }, [duration, onStart, changeCurrentFocus, targetId, targetRef]);

  const endFocus = useCallback(
    (negative?: boolean) => {
      if (!negative && currentFocusRef.current !== targetId) {
        return;
      }

      setIsFocus(false);
      setMoving(!negative);
      setInitd(true);
      onStart?.(false);
    },
    [currentFocusRef, onStart, targetId]
  );

  const toggleFocus = useCallback(
    (e?: ThreeEvent<MouseEvent>) => {
      if (e) {
        e.stopPropagation();
      }

      if (moving) return;

      if (isFocus) {
        endFocus();
      } else {
        startFocus();
      }
    },
    [endFocus, isFocus, moving, startFocus]
  );

  useEffect(() => {
    if (isFocus) {
      setTimeout(() => setIsDelayFocus(true), duration);
    } else {
      setIsDelayFocus(false);
    }
    currentCameraPos.current = camera.position.clone();
  }, [camera.position, duration, isFocus, targetId]);

  useEffect(() => {
    if (targetRef?.current) {
      setTargetPos(
        targetRef.current.getWorldPosition(new THREE.Vector3(0, 0, 0)) ||
          new THREE.Vector3(0, 0, 0)
      );
    }
  }, [targetRef, sceneReady]);

  useEffect(() => {
    if (!moving && initd) {
      onEndRef.current?.(isFocus);
    }
  }, [initd, isFocus, moving, onEndRef]);

  useEffect(() => {
    if (isFocus && currentFocus && currentFocus !== targetId) {
      endFocus(true);
    }
  }, [currentFocus, endFocus, isFocus, targetId]);

  useFrame((_, delta) => {
    if (!moving || currentFocus !== targetId) return;

    // 累计时间
    elapsedTime.current = delta * 1000 + elapsedTime.current; // 将 delta 转换为毫秒
    // 计算插值因子 t
    const t = Math.min(elapsedTime.current / duration, 1);

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
        camera.position.quadraticBezier(current, midPoints[0], from, t);
      } else {
        camera.position.lerpVectors(current, from, t);
      }
    }

    if (t >= 1) {
      elapsedTime.current = 0;
      camera.currentLookAtPoint = lookAtTargetPos.clone();
      setMoving(false);

      if (!isFocus) {
        changeCurrentFocus('');
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
