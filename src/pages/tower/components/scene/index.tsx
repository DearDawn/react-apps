import React, { useRef, useEffect } from 'react';
import { Canvas, ObjectMap, useFrame, useLoader } from '@react-three/fiber';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import * as GLBModel from '../../models/02.glb';

const Model = () => {
  const gltf = useLoader(GLTFLoader, GLBModel) as GLTF & ObjectMap;
  const modelRef = useRef<THREE.Object3D>();
  const mixerRef = useRef<THREE.AnimationMixer>();

  useEffect(() => {
    modelRef.current.rotation.y = Math.PI / 2; // 绕 Z 轴旋转 30 度

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

const ThreeScene = () => {
  return (
    <Canvas
      camera={{ position: [20, 10, 0], fov: 75 }}
      style={{ width: '100%', height: '100vh' }}
      gl={{
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
    >
      <Environment preset='city' background />
      <ambientLight intensity={1} color={0x6d513a} />
      <directionalLight position={[1, 1, 1]} intensity={0.5} />
      <Model />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
};

export default ThreeScene;
