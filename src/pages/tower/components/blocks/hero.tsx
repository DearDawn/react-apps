import React, { useRef, useState, useContext, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GameContext } from '../scene';
import Hero from '../../entities/hero';

export const HeroComp = ({ hero }: { hero: Hero }) => {
  const { enemies, setHeros } = useContext(GameContext);
  const { camera, gl } = useThree();
  const [targetPosition, setTargetPosition] = useState(hero.position.clone());
  const [isDragging, setIsDragging] = useState(false);
  const heroRef = useRef();

  useEffect(() => {
    if (!heroRef.current) return;

    const controls = new DragControls([heroRef.current], camera, gl.domElement);

    controls.addEventListener('dragstart', () => {
      setIsDragging(true);
    });

    controls.addEventListener('drag', (event) => {
      const { x, y } = event.uv;
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
    if (!hero) return;

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

    hero.onDeath(() => {
      console.log('[dodo] ', '英雄牺牲', hero.score);
      setHeros((prevHeros) => prevHeros.filter((h) => h !== hero));
    });
  }, [enemies, hero, setHeros]);

  useFrame(() => {
    if (!hero) return;

    if (hero.status === 'attack') {
      hero.attackTarget();
    } else {
      hero.move(() => {
        hero.attackTarget();
      });
    }

    if (!isDragging) {
      hero.position.lerp(targetPosition, 0.1);
    }
  });

  if (!hero) return null;

  return (
    <mesh ref={heroRef} position={hero.position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='yellow' />
    </mesh>
  );
};