import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Hero from '../../entities/hero';

const HeroBar = ({ setHeros }) => {
  const barRef = useRef<THREE.Mesh>();
  const { camera } = useThree();

  useFrame(() => {
    if (barRef.current) {
      // 始终面向相机
      barRef.current.lookAt(camera.position);
    }
  });

  const handleDragEnd = (event) => {
    const { x, y } = event.uv;
    const worldPosition = new THREE.Vector3(x, 0, y).unproject(camera);
    const newHero = new Hero({
      position: worldPosition,
      health: 100,
      defense: 5,
      attack: 15,
      attackSpeed: 500,
      moveSpeed: 0.02,
      id: 'hero',
    });
    setHeros((prevHeros) => [...prevHeros, newHero]);
  };

  return (
    <mesh ref={barRef} position={[0, 0, 0]}>
      <group position={[0, 0, 20]}>
        <boxGeometry args={[10, 4, 1]} />
        <meshStandardMaterial color='gray' />
        <mesh position={[0, 0, 0.01]} onPointerUp={handleDragEnd}>
          <boxGeometry args={[0.5, 0.1, 0.1]} />
          <meshStandardMaterial color='blue' />
        </mesh>
      </group>
    </mesh>
  );
};

export { HeroBar };
