import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterWrap } from '../character';
import { CharacterWrapV2 } from '../characterV2';

const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <circleGeometry args={[20, 50]} />
      <meshStandardMaterial color='green' />
    </mesh>
  );
};

const Tower = ({ towerRef }) => {
  return (
    <mesh ref={towerRef} position={[0, 2.5, 0]}>
      <boxGeometry args={[2, 5, 2]} />
      <meshStandardMaterial color='gray' />
    </mesh>
  );
};

const Enemy = ({ enemy, onAttack }) => {
  const { position, targetRef, delay, meshRef } = enemy;
  const [isAttacking, setIsAttacking] = useState(false);
  const attackLock = useRef(false);

  useFrame(() => {
    if (isAttacking) {
      if (attackLock.current) return;

      attackLock.current = true;
      setTimeout(() => {
        attackLock.current = false;
      }, delay);
      onAttack(meshRef, targetRef);
      return;
    }

    if (meshRef.current) {
      const direction = new THREE.Vector3()
        .subVectors(targetRef.current.position, meshRef.current.position)
        .normalize();
      meshRef.current.position.add(direction.multiplyScalar(0.01));

      const distanceToTarget = meshRef.current.position.distanceTo(
        targetRef.current.position
      );

      if (distanceToTarget < 1) {
        setIsAttacking(true);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='blue' />
    </mesh>
  );
};

const Hero = ({ enemies, onAttack }) => {
  const meshRef = useRef<THREE.Mesh>();
  const [targetEnemy, setTargetEnemy] = useState<{
    meshRef: React.MutableRefObject<THREE.Mesh>;
    id: string;
  }>();
  const [isAttacking, setIsAttacking] = useState(false);
  const attackLock = useRef(false);

  useEffect(() => {
    if (enemies.length > 0) {
      const closestEnemy = enemies.reduce(
        (closest, enemy) => {
          const distance = meshRef.current.position.distanceTo(enemy.position);
          return distance < closest.distance ? { distance, ...enemy } : closest;
        },
        { distance: Infinity, ...enemies[0] }
      );

      setTargetEnemy(closestEnemy);
    }
  }, [enemies]);

  useFrame(() => {
    if (isAttacking) {
      if (attackLock.current) return;

      attackLock.current = true;
      setTimeout(() => {
        attackLock.current = false;
      }, 500);
      onAttack(meshRef, targetEnemy);
      return;
    }

    if (meshRef.current && targetEnemy) {
      const direction = new THREE.Vector3()
        .subVectors(
          targetEnemy.meshRef.current.position,
          meshRef.current.position
        )
        .normalize();
      meshRef.current.position.add(direction.multiplyScalar(0.01));

      const distanceToTarget = meshRef.current.position.distanceTo(
        targetEnemy.meshRef.current.position
      );

      if (distanceToTarget < 1) {
        setIsAttacking(true);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='yellow' />
    </mesh>
  );
};

const ThreeScene = () => {
  const [enemies, setEnemies] = useState([]);
  const towerRef = useRef<THREE.Mesh>();

  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      setEnemies((prevEnemies) =>
        prevEnemies.length >= 3
          ? prevEnemies
          : [
              ...prevEnemies,
              {
                position: new THREE.Vector3(x, 0, z),
                meshRef: React.createRef(),
                targetRef: towerRef,
                delay: 700,
                id: Math.random().toString(),
              },
            ]
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEnemyAttack = (attacker, hero) => {
    hero.current.material.color.set('red');
    setTimeout(() => {
      hero.current.material.color.set('yellow');
    }, 200);
  };

  const handleHeroAttack = (attacker, enemy) => {
    const targetEnemyIndex = enemies.findIndex((e) => e.id === enemy.id);

    setEnemies((prevEnemies) => {
      prevEnemies[targetEnemyIndex].targetRef = attacker;
      return [...prevEnemies];
    });

    enemy.meshRef.current.material.color.set('red');
    setTimeout(() => {
      enemy.meshRef.current.material.color.set('blue');
    }, 200);
  };

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
      <Environment preset='city' background={false} />
      <ambientLight intensity={1} color={0x6d513a} />
      <directionalLight position={[1, 1, 1]} intensity={0.5} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
      <CharacterWrap />
      <CharacterWrapV2 />
      <Ground />
      <Tower towerRef={towerRef} />
      {enemies.map((enemy, index) => (
        <Enemy key={index} enemy={enemy} onAttack={handleEnemyAttack} />
      ))}
      <Hero enemies={enemies} onAttack={handleHeroAttack} />
    </Canvas>
  );
};

export default ThreeScene;