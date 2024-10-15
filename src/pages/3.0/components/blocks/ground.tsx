
export const GroundComp = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <circleGeometry args={[20, 50]} />
      <meshStandardMaterial color='green' />
    </mesh>
  );
};
