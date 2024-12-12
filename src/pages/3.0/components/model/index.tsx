import { useRef, useEffect, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { GLTF } from 'three-stdlib';
import * as THREE from 'three';
import { useFocus, useGltfLoader } from '../../hooks';
import { Html, useAnimations } from '@react-three/drei';

type GLTFResult = GLTF & {
  nodes: {
    平面: THREE.Mesh;
    table: THREE.Mesh;
    柱体: THREE.Mesh;
    立方体001_1: THREE.Mesh;
    立方体001_2: THREE.Mesh;
    ['02-v2']: THREE.Mesh;
    keyboard: THREE.Mesh;
    立方体003: THREE.Mesh;
    立方体002_1: THREE.Mesh;
    立方体002_2: THREE.Mesh;
    圆环: THREE.Mesh;
    柱体001: THREE.Mesh;
    chair: THREE.Mesh;
    球体: THREE.Mesh;
    立方体001: THREE.Mesh;
    立方体007: THREE.Mesh;
    立方体010: THREE.Mesh;
    立方体009: THREE.Mesh;
    立方体008: THREE.Mesh;
    立方体006: THREE.Mesh;
    立方体012: THREE.Mesh;
    立方体012_1: THREE.Mesh;
    立方体002: THREE.Mesh;
    立方体014: THREE.Mesh;
    立方体014_1: THREE.Mesh;
    立方体005: THREE.Mesh;
    骨骼: THREE.Bone;
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
    plate: THREE.MeshStandardMaterial;
    person: THREE.MeshStandardMaterial;
    floor: THREE.MeshStandardMaterial;
    floor_inner: THREE.MeshStandardMaterial;
    sofa: THREE.MeshStandardMaterial;
    phone: THREE.MeshStandardMaterial;
    phonescreenimage: THREE.MeshStandardMaterial;
  };
};

export const Model = (props) => {
  const gltf = useGltfLoader<GLTFResult>('/public/models/3.0/room_v4.glb');
  const { camera } = useThree();
  const { nodes, materials, animations } = gltf || {};

  const [isFocusPhone, setIsFocusPhone] = useState(false);
  const [movingPhone, setMovingPhone] = useState(false);
  const [screenPosition, setScreenPosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );
  const [phonePosition, setPhonePosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );
  const targetPositionPhone = new THREE.Vector3()
    .copy(phonePosition)
    .add(new THREE.Vector3(0, 1, 0));
  const group = useRef<THREE.Object3D>();
  const pcRef = useRef<THREE.Mesh>();
  const phoneRef = useRef<THREE.Mesh>();
  const mixerRef = useRef<THREE.AnimationMixer>();
  const initialCameraPos = useRef(camera.position.clone());
  const { actions } = useAnimations(animations, group);
  const bodyRef = useRef(document.body);
  const htmlRef = useRef<HTMLDivElement>(null);
  const duration = 500; // 动画持续时间
  const elapsedTime = useRef(0); // 累计时间

  const { startFocus, endFocus, isFocus, moving } = useFocus({
    camera,
    target: screenPosition,
    offset: new THREE.Vector3(0, 0, 4),
    duration,
  });
  const movingLock = moving || movingPhone;

  const handleFocus = (e: ThreeEvent<MouseEvent>) => {
    if (movingLock) return;

    e.stopPropagation();

    setTimeout(
      () => {
        handlePlayAnimation(!isFocus);
      },
      isFocus ? 100 : 0
    );

    if (isFocus) {
      endFocus();
    } else {
      startFocus();
    }
  };

  const handleFocusPhone = (e: ThreeEvent<MouseEvent>) => {
    if (movingLock) return;

    e.stopPropagation();

    elapsedTime.current = 0;
    setIsFocusPhone(!isFocusPhone);
    setMovingPhone(true);
  };

  const handlePlayAnimation = (leave = false) => {
    actions.move.reset();
    actions.move.setLoop(THREE.LoopOnce, 1);
    actions.move.clampWhenFinished = true; // 设置为 true，动画播放完毕后停留在最后一帧

    if (leave) {
      actions.move.setEffectiveTimeScale(2);
      actions.move.play();
    } else {
      actions.move.setEffectiveTimeScale(-2);
      actions.move.time = gltf.animations[0].duration; // 倒放时重置到最后一帧
      actions.move.play();
    }
  };

  useEffect(() => {
    // modelRef.current.rotation.y = Math.PI / 4; // 绕 Z 轴旋转 30 度
    group.current.scale.set(3, 3, 3);
    group.current.position.setY(-10);

    if (gltf && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(group.current);
      const action = mixerRef.current.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }

    const screenPos = pcRef.current.getWorldPosition(
      new THREE.Vector3(0, 0, 0)
    );
    setScreenPosition(screenPos);

    setPhonePosition(
      phoneRef.current.getWorldPosition(new THREE.Vector3(0, 0, 0))
    );

    camera.lookAtPoint = screenPos.clone();
    camera.lookAt(camera.lookAtPoint);

    return () => {
      mixerRef.current.stopAllAction();
    };
  }, [camera, gltf]);

  // useEffect(() => {
  //   setTimeout(
  //     () => {
  //       setIsFocusDelay(isFocus);
  //     },
  //     isFocus ? 500 : 0
  //   );
  // }, [isFocus]);

  useFrame((state, delta) => {
    if (!phoneRef.current || !movingPhone) return;

    // 累计时间
    elapsedTime.current = delta * 1000 + elapsedTime.current; // 将 delta 转换为毫秒
    // 计算插值因子 t
    const t = Math.min(elapsedTime.current / 800, 1);

    const lookAtTargetPos = isFocusPhone
      ? new THREE.Vector3().lerpVectors(
          camera.lookAtPoint.clone(),
          phonePosition.clone(),
          t
        )
      : new THREE.Vector3().lerpVectors(
          phonePosition.clone(),
          camera.lookAtPoint.clone(),
          t
        );

    if (t >= 1) {
      setMovingPhone(false);
    }

    if (isFocusPhone) {
      camera.position.quadraticBezier(
        initialCameraPos.current,
        {
          x: targetPositionPhone.x,
          y: targetPositionPhone.y + 2,
          z: 0,
        },
        targetPositionPhone,
        t
      );
    } else {
      camera.position.quadraticBezier(
        targetPositionPhone,
        {
          x: targetPositionPhone.x,
          y: targetPositionPhone.y + 2,
          z: 0,
        },
        initialCameraPos.current,
        t
      );
    }

    camera.lookAt(lookAtTargetPos);
  });

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  const HtmlComp = () => {
    return (
      <Html
        ref={htmlRef}
        position={[0, 0.114, 0.07]}
        calculatePosition={(el, camera, size) => {
          if (!pcRef.current || !htmlRef.current) return [0, 0, 0];

          // 获取 mesh 的世界位置
          const worldPosition = new THREE.Vector3();
          pcRef.current.getWorldPosition(worldPosition);

          // 将世界坐标转换为屏幕坐标
          const screenPosition = worldPosition.clone().project(camera);

          // 获取视口的宽度和高度
          const viewportWidth = size.width;
          const viewportHeight = size.height;

          // 将屏幕坐标的范围从 [-1, 1] 转换为 [0, viewportWidth] 和 [0, viewportHeight]
          const x = ((screenPosition.x + 1) / 2) * viewportWidth;
          const y = ((1 - screenPosition.y) / 2) * viewportHeight;

          // 现在 x 和 y 的范围是 [0, viewportWidth] 和 [0, viewportHeight]，可以用来设置 HTML 元素的位置
          // console.log(`Screen position: (${x}, ${y})`);

          return [x, y];
        }}
        // scale={0.1}
        style={{
          transform: `translate(-50%, -50%) scale(0.1)`,
        }}
        castShadow
        receiveShadow
        // pointerEvents={isFocus ? 'all' : 'none'}
        // occlude='blending'
        // visible={isFocusDelay}
        portal={bodyRef}
      >
        <iframe
          src='https://dododawn.com/'
          style={{
            width: '1440px',
            height: '840px',
            borderRadius: '60px',
            boxSizing: 'border-box',
            background: 'transparent',
            transition: isFocus ? 'all 0.2s 0.4s linear' : 'all 0.2s linear',
            // opacity: isFocus ? 1 : 0,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        ></iframe>
      </Html>
    );
  };

  return (
    <group ref={group} {...props} dispose={null}>
      <group name='Scene'>
        <group name='Scene_Collection' userData={{ name: 'Scene Collection' }}>
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
                name='立方体001_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体001_1.geometry}
                material={materials.pc}
              />
              <mesh
                name='立方体001_2'
                castShadow
                receiveShadow
                geometry={nodes.立方体001_2.geometry}
                material={materials.screen}
                ref={pcRef}
              >
                {/* <HtmlComp /> */}
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
                name='立方体002_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体002_1.geometry}
                material={materials.mouse_board}
              />
              <mesh
                name='立方体002_2'
                castShadow
                receiveShadow
                geometry={nodes.立方体002_2.geometry}
                material={materials.mouse_board_top}
              />
            </group>
            <mesh
              name='圆环'
              castShadow
              receiveShadow
              geometry={nodes.圆环.geometry}
              material={materials.plate}
              position={[0.863, 1.746, -2.457]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.108}
              userData={{ name: '圆环' }}
            />
            <mesh
              name='柱体001'
              castShadow
              receiveShadow
              geometry={nodes.柱体001.geometry}
              material={nodes.柱体001.material}
              userData={{ name: '柱体.001' }}
            />
          </group>
          <group name='Body' userData={{ name: 'Body' }}>
            <mesh
              name='chair'
              castShadow
              receiveShadow
              geometry={nodes.chair.geometry}
              material={materials.table}
              position={[0.008, 0.399, -1.102]}
              userData={{ name: 'chair' }}
            >
              <group
                name='骨架'
                position={[0.05, -0.043, -0.187]}
                scale={0.365}
                userData={{ name: '骨架' }}
              >
                <primitive object={nodes.骨骼} />
              </group>
            </mesh>
            <group name='立方体' userData={{ name: '立方体' }}>
              <mesh
                name='立方体012'
                castShadow
                receiveShadow
                geometry={nodes.立方体012.geometry}
                material={materials.floor}
              />
              <mesh
                name='立方体012_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体012_1.geometry}
                material={materials.floor_inner}
              />
            </group>
            <mesh
              name='立方体002'
              castShadow
              receiveShadow
              geometry={nodes.立方体002.geometry}
              material={materials.sofa}
              position={[-2.105, 0.268, -0.468]}
              userData={{ name: '立方体.002' }}
            />
            <group
              name='立方体004'
              position={[0.616, 0.6, -2.051]}
              rotation={[Math.PI, 0, Math.PI]}
              userData={{ name: '立方体.004' }}
              onClick={handleFocusPhone}
            >
              <mesh
                name='立方体014'
                castShadow
                receiveShadow
                geometry={nodes.立方体014.geometry}
                material={materials.phone}
              />
              <mesh
                name='立方体014_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体014_1.geometry}
                material={materials.phonescreenimage}
                ref={phoneRef}
              />
            </group>
            <mesh
              name='立方体005'
              castShadow
              receiveShadow
              geometry={nodes.立方体005.geometry}
              material={materials.table}
              position={[0.863, 1.746, -2.46]}
              userData={{ name: '立方体.005' }}
            />
          </group>
        </group>
      </group>
    </group>
  );
};
