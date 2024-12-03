import { useRef, useEffect, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import * as GLBModel from '../../models/room.glb';
import { useGltfLoader } from '../../hooks';

type GLTFResult = GLTF & {
  nodes: {
    平面: THREE.Mesh;
    立方体: THREE.Mesh;
    柱体: THREE.Mesh;
    立方体001_1: THREE.Mesh;
    立方体001_2: THREE.Mesh;
    ['02-v2']: THREE.Mesh;
    立方体002: THREE.Mesh;
    立方体003: THREE.Mesh;
    立方体002_1: THREE.Mesh;
    立方体002_2: THREE.Mesh;
  };
  materials: {
    wall: THREE.MeshStandardMaterial;
    table: THREE.MeshStandardMaterial;
    leg: THREE.MeshStandardMaterial;
    pc: THREE.MeshStandardMaterial;
    screen: THREE.MeshStandardMaterial;
    ['02-v2']: THREE.MeshStandardMaterial;
    keyboard: THREE.MeshStandardMaterial;
    keyboard_inner: THREE.MeshStandardMaterial;
    mouse_board: THREE.MeshStandardMaterial;
    mouse_board_top: THREE.MeshStandardMaterial;
  };
};

export const Model = (props) => {
  const gltf = useGltfLoader(GLBModel) as GLTFResult;
  const { camera } = useThree();
  const { nodes, materials } = gltf || {};
  const [isFocus, setIsFocus] = useState(false);
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
    e.stopPropagation();
    setIsFocus((_isFocus) => !_isFocus);
    elapsedTime.current = 0;
    setMoving(true);
  };

  useEffect(() => {
    // modelRef.current.rotation.y = Math.PI / 4; // 绕 Z 轴旋转 30 度
    modelRef.current.scale.set(3, 3, 3);
    modelRef.current.position.setY(-10);

    if (gltf && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(modelRef.current);
      gltf.animations.forEach((clip) => {
        const action = mixerRef.current.clipAction(clip);
        action.play();
      });

      return () => {
        mixerRef.current.stopAllAction();
      };
    }

    // 获取目标元素的位置
    const screenPos = screenRef.current.getWorldPosition(
      new THREE.Vector3(0, 0, 0)
    );

    // 计算目标位置
    setScreenPosition(screenPos);
  }, [gltf]);

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
    <group {...props} dispose={null} ref={modelRef}>
      <group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.平面.geometry}
          material={materials.wall}
          userData={{ name: '平面' }}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.立方体.geometry}
          material={materials.table}
          position={[0, 0.545, -2]}
          scale={[0.667, 0.5, 0.5]}
          userData={{ name: '立方体' }}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.柱体.geometry}
            material={materials.leg}
            position={[0, -1.821, 4]}
            userData={{ name: '柱体' }}
          />
        </mesh>
        <group
          position={[0, 0.975, -2.427]}
          userData={{ name: '立方体.001' }}
          onClick={handleFocus}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.立方体001_1.geometry}
            material={materials.pc}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.立方体001_2.geometry}
            material={materials.screen}
            ref={screenRef}
          />
        </group>
        <mesh
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
          castShadow
          receiveShadow
          geometry={nodes.立方体002.geometry}
          material={materials.keyboard}
          position={[-0.074, 0.612, -2.097]}
          userData={{ name: '立方体.002' }}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.立方体003.geometry}
            material={materials.keyboard_inner}
            position={[0, 0.013, 0]}
            userData={{ name: '立方体.003' }}
          />
        </mesh>
        <group
          position={[0.33, 0.602, -2.097]}
          scale={0.796}
          userData={{ name: '立方体.004' }}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.立方体002_1.geometry}
            material={materials.mouse_board}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.立方体002_2.geometry}
            material={materials.mouse_board_top}
          />
        </group>
      </group>
    </group>
  );
};
