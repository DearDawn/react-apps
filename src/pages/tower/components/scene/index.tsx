import React, { useEffect, useState, createContext, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterWrap } from '../character';
import { CharacterWrapV2 } from '../characterV2';
import Enemy from '../../entities/enemy';
import { Tower } from '../../entities/tower';
import Hero from '../../entities/hero';

export const GameContext = createContext<{
  tower: Tower;
  hero: Hero;
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
}>(null);

const GroundComp = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <circleGeometry args={[20, 50]} />
      <meshStandardMaterial color='green' />
    </mesh>
  );
};

const TowerComp = ({ tower }: { tower: Tower }) => {
  return (
    <mesh ref={tower.meshRef} position={[0, 2.5, 0]}>
      <boxGeometry args={[2, 5, 2]} />
      <meshStandardMaterial color='gray' />
    </mesh>
  );
};

const EnemyComp = ({ enemy }: { enemy: Enemy }) => {
  const { position, meshRef } = enemy;
  const { tower, setEnemies } = useContext(GameContext);

  useEffect(() => {
    enemy.setTarget(tower);
    enemy.onDeath(() => {
      setEnemies((enemies) => enemies.filter((enemy) => enemy.alive));
    });
  }, [enemy, setEnemies, tower]);

  useFrame(() => {
    enemy.move();
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='blue' />
    </mesh>
  );
};

const HeroComp = ({ hero }: { hero: Hero }) => {
  const { enemies } = useContext(GameContext);

  useEffect(() => {
    if (enemies.length > 0) {
      const closestEnemy = enemies.reduce(
        (closest, enemy) => {
          const distance = hero.position.distanceTo(enemy.position);
          return distance < closest.distance ? { distance, enemy } : closest;
        },
        { distance: Infinity, enemy: enemies[0] }
      );

      hero.setTarget(closestEnemy.enemy);
    }
  }, [enemies, hero]);

  useFrame(() => {
    console.log('[dodo] ', '1111', hero.attacking);
    if (hero.attacking) {
      hero.attackTarget();
    } else {
      hero.move(() => {
        hero.attackTarget();
      });
    }
  });

  return (
    <mesh ref={hero.meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='yellow' />
    </mesh>
  );
};

const ThreeScene = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const [tower] = useState(
    new Tower({
      position: new THREE.Vector3(0, 2.5, 0),
      health: 100,
      defense: 10,
      attack: 20,
      soldierCapacity: 10,
    })
  );

  const [hero] = useState(
    new Hero({
      position: new THREE.Vector3(0, 0, 0),
      health: 100,
      defense: 5,
      attack: 15,
      attackSpeed: 500,
      moveSpeed: 0.01,
      id: Math.random().toString(),
    })
  );

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
              new Enemy({
                position: new THREE.Vector3(x, 0, z),
                id: Math.random().toString(),
                health: 50,
                defense: 2,
                attack: 10,
                attackSpeed: 700,
                moveSpeed: 0.01,
              }),
            ]
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ tower, hero, enemies, setEnemies }}>
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
        <GroundComp />
        <TowerComp tower={tower} />
        {enemies.map((enemy, index) => (
          <EnemyComp key={index} enemy={enemy} />
        ))}
        <HeroComp hero={hero} />
      </Canvas>
    </GameContext.Provider>
  );
};

export default ThreeScene;
