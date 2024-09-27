import { useContext, useEffect } from "react";
import { Tower } from "../../entities/tower";
import { GameContext } from "../scene";

export const TowerComp = ({ tower }: { tower: Tower }) => {
  const { setTower } = useContext(GameContext);

  useEffect(() => {
    tower.onDeath(() => {
      // setTower(null);
    });
  }, [setTower, tower]);

  if (!tower) return null;

  return (
    <mesh ref={tower.meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 8, 2]} />
      <meshStandardMaterial color='gray' />
    </mesh>
  );
};
