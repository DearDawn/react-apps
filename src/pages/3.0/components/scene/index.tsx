import React, { useState, createContext, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
// import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createXRStore, XR } from '@react-three/xr';
import { Model } from '../model';
import { CanvasWrapper } from './canvasWrap';
import { Light } from '../model/light';
const store = createXRStore();

export const GameContext = createContext<{
  setEnableOrbitControls: React.Dispatch<React.SetStateAction<boolean>>;
  setSceneReady: React.Dispatch<React.SetStateAction<number>>;
  sceneReady: number;
  enableOrbitControls: boolean;
  currentFocus: string;
  currentFocusRef: React.MutableRefObject<string>;
  changeCurrentFocus: (focus: string) => void;
}>(null);

const ThreeScene = () => {
  const [enableOrbitControls, setEnableOrbitControls] = useState(true);
  const [sceneReady, setSceneReady] = useState(0);
  const [currentFocus, setCurrentFocus] = useState('');
  const currentFocusRef = useRef('');

  const changeCurrentFocus = useCallback((focus: string) => {
    setCurrentFocus(focus);
    currentFocusRef.current = focus;
  }, []);

  return (
    <>
      {/* <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button> */}
      <GameContext.Provider
        value={{
          setEnableOrbitControls,
          sceneReady,
          enableOrbitControls,
          currentFocusRef,
          setSceneReady,
          currentFocus,
          changeCurrentFocus,
        }}
      >
        <CanvasWrapper>
          <Canvas
            resize={{ debounce: 500 }}
            camera={{ position: [8, -5, 2], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            shadows
            gl={{
              outputColorSpace: THREE.SRGBColorSpace,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1,
            }}
          >
            <XR store={store}>
              <Light />
              {/* <OrbitControls
              enableDamping
              dampingFactor={0.05}
              screenSpacePanning={false}
              minDistance={1}
              maxDistance={50}
              maxPolarAngle={Math.PI / 2}
              enabled={false}
            /> */}
              <Model />
            </XR>
          </Canvas>
        </CanvasWrapper>
      </GameContext.Provider>
    </>
  );
};

export default ThreeScene;
