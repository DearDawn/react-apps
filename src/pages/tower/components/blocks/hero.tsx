import React, { useState, useContext, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GameContext } from '../scene';
import Hero from '../../entities/hero';

export const HeroComp = ({ hero }: { hero: Hero }) => {
  const { tower, enemies, enemyRefresh, setHeros, setEnemyRefresh } =
    useContext(GameContext);
  const { camera, gl } = useThree();
  const [targetPosition, setTargetPosition] = useState(hero.position.clone());
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!hero.meshRef.current) return;

    const controls = new DragControls(
      [hero.meshRef.current],
      camera,
      gl.domElement
    );

    controls.addEventListener('dragstart', () => {
      setIsDragging(true);
    });

    controls.addEventListener('drag', (event) => {
      const { x, y } = event.object.position;
      const worldPosition = new THREE.Vector3(x, 0, y).unproject(camera);
      setTargetPosition(worldPosition);
    });

    controls.addEventListener('dragend', () => {
      setIsDragging(false);
      hero.position.copy(targetPosition);
    });

    return () => {
      controls.dispose();
    };
  }, [camera, gl, hero, targetPosition]);

  useEffect(() => {
    if (!hero || (hero.attack && hero.target?.alive)) return;

    if (enemies.length > 0) {
      const closestEnemy = hero.findClosestTarget(enemies, tower);
      hero.setTarget(closestEnemy);
    }

    hero.onDeath(() => {
      console.log('[dodo] ', '英雄牺牲', hero.score);
      setHeros((prevHeros) => prevHeros.filter((h) => h !== hero));
    });
  }, [enemies, hero, setHeros, tower, enemyRefresh]);

  useFrame(() => {
    if (!hero) return;

    if (hero.status === 'attack') {
      hero.attackTarget();
    } else {
      hero.move(() => {
        setEnemyRefresh((cnt) => cnt + 1);
        hero.attackTarget();
      });
    }

    // if (!isDragging) {
    //   hero.position.lerp(targetPosition, 0.1);
    // }
  });

  if (!hero) return null;

  return (
    <mesh ref={hero.meshRef} position={hero.position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='yellow' />
    </mesh>
  );
};
