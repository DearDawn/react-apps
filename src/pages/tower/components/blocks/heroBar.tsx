import React, { useContext, useRef, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Hero from '../../entities/hero';
import { GameContext } from '../scene';

const HeroBar = ({ setHeros }) => {
  const barRef = useRef<THREE.Mesh>();
  const menuRef = useRef<THREE.Mesh>();
  const heroRef = useRef<THREE.Mesh>();
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3());
  const { setEnableOrbitControls } = useContext(GameContext);

  useFrame(() => {
    if (barRef.current) {
      // 始终面向相机
      barRef.current.lookAt(camera.position.x, 0, camera.position.z);
    }
  });

  const handleDragStart = () => {
    setIsDragging(true);
    setEnableOrbitControls(false);
  };

  const handleDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    const { x, y } = event.uv;
    const worldPosition = new THREE.Vector3(x, 0, y).unproject(camera);
    const localPosition = heroRef.current.parent.worldToLocal(
      worldPosition.clone()
    );
    console.log(
      '[dodo] ',
      'heroRef.current.position',
      heroRef.current.position,
      localPosition
    );
    heroRef.current.position.copy(localPosition);
    setTargetPosition(worldPosition);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setEnableOrbitControls(true);

    handleAddHero();
  };

  const handleAddHero = () => {
    const newHero = new Hero({
      position: new THREE.Vector3(0, 0, 0),
      health: 100,
      defense: 5,
      attack: 15,
      attackSpeed: 500,
      moveSpeed: 0.015 + Math.random() * 0.005,
      id: 'hero',
    });
    setHeros((prevHeros) => [...prevHeros, newHero]);
  };

  return (
    <mesh ref={barRef} position={[0, 0, 0]}>
      {/* <cylinderGeometry args={[20, 20, 0.1, 32]} />
      <meshStandardMaterial color='pink' /> */}
      <mesh
        position={[0, -1, 21]}
        rotation={[-Math.PI / 4, 0, 0]}
        ref={menuRef}
      >
        <boxGeometry args={[8, 2.5, 0.1]} />
        <meshStandardMaterial color='gray' />
        <mesh
          position={[0, 0, 1]}
          onClick={handleAddHero}
          // onPointerDown={handleDragStart}
          // onPointerMove={handleDrag}
          // onPointerUp={handleDragEnd}
          ref={heroRef}
        >
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color='blue' />
        </mesh>
      </mesh>
      {isDragging && (
        <mesh position={targetPosition}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color='red' />
        </mesh>
      )}
    </mesh>
  );
};

export { HeroBar };
