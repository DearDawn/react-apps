import { useContext, useEffect } from "react";
import Enemy from "../../entities/enemy";
import { GameContext } from "../scene";
import { useFrame } from "@react-three/fiber";

export const EnemyComp = ({ enemy }: { enemy: Enemy }) => {
  const { position, meshRef } = enemy;
  const { tower, setEnemies } = useContext(GameContext);

  useEffect(() => {
    enemy.setTarget(tower);
    enemy.onDeath(() => {
      setEnemies((enemies) => enemies.filter((enemy) => enemy.alive));
    });
  }, [enemy, setEnemies, tower]);

  useFrame(() => {
    if (enemy.status === 'attack') {
      enemy.attackTarget();
    } else {
      if (!enemy.target) {
        enemy.setTarget(tower);
      }
      enemy.move(() => {
        enemy.attackTarget();
      });
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='blue' />
    </mesh>
  );
};