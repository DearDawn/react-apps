import { useContext, useEffect } from 'react';
import Hero from '../../entities/hero';
import { GameContext } from '../scene';
import { useFrame } from '@react-three/fiber';

export const HeroComp = ({ hero }: { hero: Hero }) => {
  const { enemies, setHero } = useContext(GameContext);

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
      setHero(null);
    });
  }, [enemies, hero, setHero]);

  useFrame(() => {
    if (!hero) return;

    if (hero.status === 'attack') {
      hero.attackTarget();
    } else {
      hero.move(() => {
        hero.attackTarget();
      });
    }
  });

  if (!hero) return null;

  return (
    <mesh ref={hero.meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='yellow' />
    </mesh>
  );
};
