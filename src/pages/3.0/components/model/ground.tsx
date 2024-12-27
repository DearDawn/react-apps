import * as THREE from 'three';

export const Ground = () => {
  return (
    <>
      {/* 一个立方体，用于投射阴影 */}
      <mesh castShadow position={[-2, -9, -2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='orange' />
      </mesh>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -10, 0]}
      >
        <planeGeometry args={[20, 20]} /> {/* 宽度和高度 */}
        <meshStandardMaterial color={new THREE.Color(0xf5efe6)} />
      </mesh>
    </>
  );
};
