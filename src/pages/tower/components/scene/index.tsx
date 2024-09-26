import React, { useEffect, useState, createContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterWrap } from '../character';
import { CharacterWrapV2 } from '../characterV2';
import Enemy from '../../entities/enemy';
import { Tower } from '../../entities/tower';
import Hero from '../../entities/hero';
import { HeroComp } from '../blocks/hero';
import { EnemyComp } from '../blocks/enemy';
import { GroundComp } from '../blocks/ground';
import { TowerComp } from '../blocks/tower';

export const GameContext = createContext<{
  tower: Tower;
  hero: Hero;
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  setHero: React.Dispatch<React.SetStateAction<Hero | null>>;
  setTower: React.Dispatch<React.SetStateAction<Tower>>;
}>(null);

const ThreeScene = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const [tower, setTower] = useState(
    new Tower({
      position: new THREE.Vector3(0, 2.5, 0),
      health: 100,
      defense: 5,
      attack: 20,
      soldierCapacity: 10,
    })
  );

  const [hero, setHero] = useState(
    new Hero({
      position: new THREE.Vector3(0, 0, 0),
      health: 100,
      defense: 5,
      attack: 15,
      attackSpeed: 500,
      moveSpeed: 0.02,
      id: 'hero',
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      setEnemies((prevEnemies) =>
        prevEnemies.length >= 2
          ? prevEnemies
          : [
              ...prevEnemies,
              new Enemy({
                position: new THREE.Vector3(x, 0, z),
                id: Math.floor(Math.random() * 1000).toString(),
                health: 50,
                defense: 2,
                attack: 10 + Math.floor(Math.random() * 10),
                attackSpeed: 700,
                moveSpeed: 0.01 + Math.random() * 0.02,
              }),
            ]
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tower) {
      window.alert('塔阵亡');
    }
  }, [tower, hero]);

  return (
    <GameContext.Provider
      value={{ tower, hero, enemies, setEnemies, setHero, setTower }}
    >
      <Canvas
        camera={{ position: [20, 10, 0], fov: 75 }}
        style={{ width: '100%', height: '100vh' }}
        gl={{
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
      >
        <ambientLight intensity={5} color={0x6d513a} />
        <directionalLight position={[1, 1, 1]} intensity={5} />
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
        {tower && <TowerComp tower={tower} />}
        {enemies.map((enemy, index) => (
          <EnemyComp key={index} enemy={enemy} />
        ))}
        {hero && <HeroComp hero={hero} />}
      </Canvas>
    </GameContext.Provider>
  );
};

export default ThreeScene;
