import React, { useState, createContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createXRStore, XR } from '@react-three/xr';
import { Model } from '../model';
const store = createXRStore();

export const GameContext = createContext<{
  setEnableOrbitControls: React.Dispatch<React.SetStateAction<boolean>>;
}>(null);

const ThreeScene = () => {
  const [enableOrbitControls, setEnableOrbitControls] = useState(true);

  return (
    <>
      {/* <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button> */}
      <GameContext.Provider value={{ setEnableOrbitControls }}>
        <Canvas
          camera={{ position: [30, 10, 0], fov: 75 }}
          style={{ width: '100%', height: '100vh' }}
          gl={{
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
          }}
        >
          <XR store={store}>
            <ambientLight intensity={5} color={0xffffff} />
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
            <Model />
          </XR>
        </Canvas>
      </GameContext.Provider>
    </>
  );
};

export default ThreeScene;
