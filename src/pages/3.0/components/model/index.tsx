import { useRef, useEffect, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
// import * as GLBModel from '../../models/room_v1.glb';
import { useGltfLoader } from '../../hooks';
import { Html } from '@react-three/drei';

type GLTFResult = GLTF & {
  nodes: {
    chair: THREE.Mesh;
    平面: THREE.Mesh;
    table: THREE.Mesh;
    柱体: THREE.Mesh;
    立方体001: THREE.Mesh;
    立方体001_1: THREE.Mesh;
    ['02-v2']: THREE.Mesh;
    keyboard: THREE.Mesh;
    立方体003: THREE.Mesh;
    立方体002: THREE.Mesh;
    立方体002_1: THREE.Mesh;
    球体: THREE.Mesh;
    立方体006: THREE.Mesh;
    立方体007: THREE.Mesh;
    立方体008: THREE.Mesh;
    立方体009: THREE.Mesh;
    立方体010: THREE.Mesh;
  };
  materials: {
    table: THREE.MeshStandardMaterial;
    wall: THREE.MeshStandardMaterial;
    leg: THREE.MeshStandardMaterial;
    pc: THREE.MeshStandardMaterial;
    screen: THREE.MeshStandardMaterial;
    ['02-v2']: THREE.MeshStandardMaterial;
    keyboard: THREE.MeshStandardMaterial;
    keyboard_inner: THREE.MeshStandardMaterial;
    mouse_board: THREE.MeshStandardMaterial;
    mouse_board_top: THREE.MeshStandardMaterial;
    person: THREE.MeshStandardMaterial;
  };
};

export const Model = (props) => {
  const gltf = useGltfLoader(
    'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public%2Fmodels%2F3.0%2Froom_v1.glb'
  ) as GLTFResult;
  // const gltf = useGltfLoader(GLBModel) as GLTFResult;
  const { camera } = useThree();
  const { nodes, materials } = gltf || {};
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusDelay, setIsFocusDelay] = useState(false);
  const [moving, setMoving] = useState(false);
  const [screenPosition, setScreenPosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );
  const targetPosition = new THREE.Vector3()
    .copy(screenPosition)
    .add(new THREE.Vector3(0, 0, 4));
  const modelRef = useRef<THREE.Object3D>();
  const screenRef = useRef<THREE.Mesh>();
  const mixerRef = useRef<THREE.AnimationMixer>();
  const initialCameraPos = useRef(camera.position.clone());
  const duration = 500; // 动画持续时间
  const elapsedTime = useRef(0); // 累计时间

  const handleFocus = (e: ThreeEvent<MouseEvent>) => {
    if (moving) return;

    e.stopPropagation();

    setTimeout(
      () => {
        handlePlayAnimation(!isFocus);
      },
      isFocus ? 100 : 0
    );

    setTimeout(
      () => {
        setIsFocus((_isFocus) => !_isFocus);
        elapsedTime.current = 0;
        setMoving(true);
      },
      isFocus ? 0 : 300
    );
  };

  const handlePlayAnimation = (leave = false) => {
    const action = mixerRef.current.clipAction(gltf.animations[0]);
    action.reset();
    if (leave) {
      action.timeScale = 2; // 正放
      action.play();
    } else {
      action.timeScale = -2; // 倒放
      action.time = gltf.animations[0].duration; // 倒放时重置到最后一帧
      action.play();
    }
  };

  useEffect(() => {
    // modelRef.current.rotation.y = Math.PI / 4; // 绕 Z 轴旋转 30 度
    modelRef.current.scale.set(3, 3, 3);
    modelRef.current.position.setY(-10);

    if (gltf && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(modelRef.current);
      const action = mixerRef.current.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }

    // 获取目标元素的位置
    const screenPos = screenRef.current.getWorldPosition(
      new THREE.Vector3(0, 0, 0)
    );

    // 计算目标位置
    setScreenPosition(screenPos);

    return () => {
      mixerRef.current.stopAllAction();
    };
  }, [gltf]);

  useEffect(() => {
    setTimeout(
      () => {
        setIsFocusDelay(isFocus);
      },
      isFocus ? 500 : 0
    );
  }, [isFocus]);

  useEffect(() => {
    camera.lookAt(screenPosition);
  }, [camera, screenPosition]);

  useFrame((state, delta) => {
    if (!screenRef.current || !moving) return;

    // 累计时间
    elapsedTime.current = delta * 1000 + elapsedTime.current; // 将 delta 转换为毫秒
    // 计算插值因子 t
    const t = Math.min(elapsedTime.current / duration, 1);

    if (t >= 1) {
      setMoving(false);
    }

    if (isFocus) {
      camera.position.lerpVectors(initialCameraPos.current, targetPosition, t);
    } else {
      camera.position.lerpVectors(targetPosition, initialCameraPos.current, t);
    }

    camera.lookAt(screenPosition);
  });

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={modelRef} {...props} dispose={null}>
      <group name='Scene'>
        <group name='Scene_Collection' userData={{ name: 'Scene Collection' }}>
          <mesh
            name='chair'
            castShadow
            receiveShadow
            geometry={nodes.chair.geometry}
            material={materials.table}
            position={[0.008, 0.399, -1.102]}
            userData={{ name: 'chair' }}
          />
          <group name='Collection' userData={{ name: 'Collection' }}>
            {/* <mesh
              name='平面'
              castShadow
              receiveShadow
              geometry={nodes.平面.geometry}
              material={materials.wall}
              userData={{ name: '平面' }}
            /> */}
            <mesh
              name='table'
              castShadow
              receiveShadow
              geometry={nodes.table.geometry}
              material={materials.table}
              position={[0, 0.545, -2]}
              scale={[0.667, 0.5, 0.5]}
              userData={{ name: 'table' }}
            >
              <mesh
                name='柱体'
                castShadow
                receiveShadow
                geometry={nodes.柱体.geometry}
                material={materials.leg}
                position={[-1.291, -0.59, 0.7]}
                userData={{ name: '柱体' }}
              />
            </mesh>
            <group
              name='pc'
              position={[0, 0.975, -2.427]}
              userData={{ name: 'pc' }}
              onClick={handleFocus}
            >
              <mesh
                name='立方体001'
                castShadow
                receiveShadow
                geometry={nodes.立方体001.geometry}
                material={materials.pc}
              />
              <mesh
                name='立方体001_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体001_1.geometry}
                material={materials.screen}
                ref={screenRef}
              >
                <Html
                  position={[0, 0.114, 0.07]}
                  transform
                  distanceFactor={1}
                  castShadow
                  receiveShadow
                  scale={0.24}
                  pointerEvents={isFocus ? 'all' : 'none'}
                  occlude='blending'
                  visible={isFocusDelay}
                >
                  <iframe
                    src='https://dododawn.com/'
                    style={{
                      width: '1440px',
                      height: '840px',
                      overflow: 'auto',
                      borderRadius: '60px',
                      boxSizing: 'border-box',
                      background: 'transparent',
                      transition: isFocus
                        ? 'all 0.2s 0.4s linear'
                        : 'all 0.2s linear',
                      opacity: isFocus ? 1 : 0,
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  ></iframe>
                </Html>
              </mesh>
            </group>
            <mesh
              name='02-v2'
              castShadow
              receiveShadow
              geometry={nodes['02-v2'].geometry}
              material={materials['02-v2']}
              position={[0.006, 1.095, -2.366]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.646, 0.424, 0.559]}
              userData={{ name: '02-v2' }}
            />
            <mesh
              name='keyboard'
              castShadow
              receiveShadow
              geometry={nodes.keyboard.geometry}
              material={materials.keyboard}
              position={[-0.074, 0.612, -2.097]}
              userData={{ name: 'keyboard' }}
            >
              <mesh
                name='立方体003'
                castShadow
                receiveShadow
                geometry={nodes.立方体003.geometry}
                material={materials.keyboard_inner}
                position={[0, 0.013, 0]}
                userData={{ name: '立方体.003' }}
              />
            </mesh>
            <group
              name='mouseboard'
              position={[0.33, 0.602, -2.097]}
              scale={0.796}
              userData={{ name: 'mouseboard' }}
            >
              <mesh
                name='立方体002'
                castShadow
                receiveShadow
                geometry={nodes.立方体002.geometry}
                material={materials.mouse_board}
              />
              <mesh
                name='立方体002_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体002_1.geometry}
                material={materials.mouse_board_top}
              />
            </group>
          </group>
          <group name='Body' userData={{ name: 'Body' }}>
            <mesh
              name='球体'
              castShadow
              receiveShadow
              geometry={nodes.球体.geometry}
              material={materials.person}
              position={[0.058, 0.952, -1.297]}
              userData={{ name: '球体' }}
            />
            <mesh
              name='立方体006'
              castShadow
              receiveShadow
              geometry={nodes.立方体006.geometry}
              material={materials.person}
              position={[0.058, 0.55, -1.289]}
              userData={{ name: '立方体.006' }}
            />
            <mesh
              name='立方体007'
              castShadow
              receiveShadow
              geometry={nodes.立方体007.geometry}
              material={materials.person}
              position={[-0.074, 0.487, -1.359]}
              userData={{ name: '立方体.007' }}
            />
            <mesh
              name='立方体008'
              castShadow
              receiveShadow
              geometry={nodes.立方体008.geometry}
              material={materials.person}
              position={[-0.019, 0.372, -1.557]}
              rotation={[Math.PI / 2, 0, 0]}
              userData={{ name: '立方体.008' }}
            />
            <mesh
              name='立方体009'
              castShadow
              receiveShadow
              geometry={nodes.立方体009.geometry}
              material={materials.person}
              position={[-0.019, 0.329, -1.497]}
              userData={{ name: '立方体.009' }}
            />
            <mesh
              name='立方体010'
              castShadow
              receiveShadow
              geometry={nodes.立方体010.geometry}
              material={materials.person}
              position={[-0.019, 0.329, -1.497]}
              userData={{ name: '立方体.010' }}
            />
          </group>
        </group>
      </group>
    </group>
  );
};
