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
import { HeroBar } from '../blocks/heroBar';

export const GameContext = createContext<{
  tower: Tower;
  heros: Hero[];
  enemyRefresh: number;
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  setHeros: React.Dispatch<React.SetStateAction<Hero[]>>;
  setTower: React.Dispatch<React.SetStateAction<Tower>>;
  setEnableOrbitControls: React.Dispatch<React.SetStateAction<boolean>>;
  setEnemyRefresh: React.Dispatch<React.SetStateAction<number>>;
}>(null);

const ThreeScene = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [heros, setHeros] = useState<Hero[]>([]);
  const [enemyRefresh, setEnemyRefresh] = useState(0);
  const [enableOrbitControls, setEnableOrbitControls] = useState(true);

  const [tower, setTower] = useState(
    new Tower({
      position: new THREE.Vector3(0, 0, 0),
      // health: 100,
      health: 10000,
      defense: 5,
      attack: 20,
      soldierCapacity: 10,
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      setEnemies((prevEnemies) =>
        prevEnemies.length >= 5
          ? prevEnemies
          : [
              ...prevEnemies,
              new Enemy({
                position: new THREE.Vector3(x, 0, z),
                id: 'enemy',
                health: 50,
                defense: 2,
                attack: 10 + Math.floor(Math.random() * 10),
                attackSpeed: 700,
                moveSpeed: 0.01 + Math.random() * 0.02,
              }),
            ]
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tower) {
      window.alert('塔阵亡');
    }
  }, [tower]);

  return (
    <GameContext.Provider
      value={{
        tower,
        heros,
        enemies,
        enemyRefresh,
        setEnemyRefresh,
        setEnemies,
        setHeros,
        setTower,
        setEnableOrbitControls,
      }}
    >
      <Canvas
        camera={{ position: [30, 10, 0], fov: 75 }}
        style={{ width: '100%', height: '100vh' }}
        gl={{
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
      >
        <ambientLight intensity={5} color={0x6d513a} />
        <directionalLight position={[0, 1, 0]} intensity={5} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          screenSpacePanning={false}
          minDistance={1}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
          enabled={enableOrbitControls}
        />
        <CharacterWrap />
        <CharacterWrapV2 />
        <GroundComp />
        {tower && <TowerComp tower={tower} />}
        {enemies.map((enemy, index) => (
          <EnemyComp key={index} enemy={enemy} />
        ))}
        {heros.map((hero, index) => (
          <HeroComp key={index} hero={hero} />
        ))}
        <HeroBar setHeros={setHeros} />
        <axesHelper args={[50]} />
      </Canvas>
    </GameContext.Provider>
  );
};

export default ThreeScene;
