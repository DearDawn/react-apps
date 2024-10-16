import { useRef, useEffect } from 'react';
import { ObjectMap, useFrame, useLoader } from '@react-three/fiber';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import * as GLBModel from '../../models/room.glb';

export const Model = () => {
  const gltf = useLoader(GLTFLoader, GLBModel) as GLTF & ObjectMap;
  const modelRef = useRef<THREE.Object3D>();
  const mixerRef = useRef<THREE.AnimationMixer>();

  useEffect(() => {
    modelRef.current.rotation.y = Math.PI / 4; // 绕 Z 轴旋转 30 度
    modelRef.current.scale.set(3, 3, 3);
    modelRef.current.position.setY(-9);

    if (gltf && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(modelRef.current);
      gltf.animations.forEach((clip) => {
        const action = mixerRef.current.clipAction(clip);
        action.play();
      });

      return () => {
        mixerRef.current.stopAllAction();
      };
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return <primitive ref={modelRef} object={gltf.scene} />;
};
