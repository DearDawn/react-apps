export const Light = () => {
  return (
    <>
      <ambientLight intensity={1.7} color={0xffffff} />
      <directionalLight
        position={[0, 10, 5]}
        intensity={1.5}
        color={0xffffff}
      />
      <directionalLight
        position={[0, 10, 5]}
        intensity={0.5}
        castShadow
        color={0xffffff}
      />
    </>
  );
};
