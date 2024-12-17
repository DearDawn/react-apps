import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFocus, useGltfLoader } from '../../hooks';
import { useAnimations } from '@react-three/drei';
import DebugBoundingBox from './debugBox';
import { MyHtml } from './myHtml';
import { GLTFResult } from './type';

export const Model = (props) => {
  const gltf = useGltfLoader<GLTFResult>('/public/models/3.0/room_v9.glb');
  const { camera } = useThree();
  const { nodes, materials, animations } = gltf || {};
  const [scaleRatio, setScaleRatio] = useState(1);

  const [screenPosition, setScreenPosition] = useState(new THREE.Vector3());
  const [phonePosition, setPhonePosition] = useState(new THREE.Vector3());
  const [calendarPosition, setCalendarPosition] = useState(new THREE.Vector3());
  const [padPosition, setPadPosition] = useState(new THREE.Vector3());
  const group = useRef<THREE.Object3D>();
  const pcRef = useRef<THREE.Mesh>();
  const phoneRef = useRef<THREE.Group>();
  const calendarRef = useRef<THREE.Mesh>();
  const chairRef = useRef<THREE.Mesh>();
  const padRef = useRef<THREE.Group>();
  const focusLockRef = useRef('');
  const mixerRef = useRef<THREE.AnimationMixer>();
  const { actions } = useAnimations(animations, group);

  const { toggleFocus, endFocus, isDelayFocus } = useFocus({
    camera,
    target: screenPosition,
    offset: new THREE.Vector3(0, 0, 4),
    duration: 500,
    focusLockRef,
    onStart: (_isFocus) => {
      setTimeout(() => handlePlayAnimation(_isFocus), _isFocus ? 0 : 100);
    },
  });

  const { toggleFocus: toggleFocusPhone, isDelayFocus: isDelayFocusPhone } =
    useFocus({
      camera,
      target: phonePosition,
      offset: new THREE.Vector3(0, 1 * scaleRatio, 0),
      focusLockRef,
      midPoints: [
        {
          x: phonePosition.x,
          y: phonePosition.y + 3,
          z: 0,
        },
      ],
      duration: 800,
    });

  const { toggleFocus: toggleFocusCalendar } = useFocus({
    camera,
    target: calendarPosition,
    offset: new THREE.Vector3(3 * scaleRatio, 0, 0),
    focusLockRef,
    duration: 800,
  });

  const { toggleFocus: toggleFocusPad, isDelayFocus: isDelayFocusPad } =
    useFocus({
      camera,
      target: padPosition,
      focusLockRef,
      offset: new THREE.Vector3(0, 0.3, -0.5),
      midPoints: [
        {
          x: padPosition.x + 5,
          y: padPosition.y + 5,
          z: padPosition.z - 5,
        },
      ],
      duration: 1000,
    });

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

  const handlePosObject = useCallback(() => {
    if (gltf && gltf.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(group.current);
      const action = mixerRef.current.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }

    const lookAtPos = chairRef.current.getWorldPosition(new THREE.Vector3());
    const screenPos = pcRef.current.getWorldPosition(new THREE.Vector3());
    setScreenPosition(screenPos);
    setPhonePosition(phoneRef.current.getWorldPosition(new THREE.Vector3()));
    setCalendarPosition(
      calendarRef.current.getWorldPosition(new THREE.Vector3())
    );
    setPadPosition(padRef.current.getWorldPosition(new THREE.Vector3()));

    actions['骨架.001动作'].play();
    camera.lookAtPoint = lookAtPos.clone().add(new THREE.Vector3(0, 2.5, 0));
    camera.lookAt(camera.lookAtPoint);
  }, [actions, camera, gltf]);

  const handleResize = useCallback(() => {
    const aspectRatio = Math.min(window.innerWidth / window.innerHeight, 1);
    const scale = 3 * aspectRatio;
    setScaleRatio(aspectRatio);

    group.current.scale.set(scale, scale, scale);
    group.current.position.set(0, -10, 0);
    handlePosObject();
  }, [handlePosObject]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      mixerRef.current.stopAllAction();
    };
  }, [handleResize]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <DebugBoundingBox targetRef={padRef} />
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
              onClick={toggleFocus}
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
              />
            </group>
            <mesh
              name='02-v2'
              castShadow
              receiveShadow
              geometry={nodes['02-v2'].geometry}
              material={materials['02-v2']}
              position={[0.006, 1.095, -2.366]}
              userData={{ name: '02-v2' }}
              ref={pcRef}
            >
              <MyHtml
                targetRef={pcRef}
                visible={isDelayFocus}
                onClose={endFocus}
              />
            </mesh>
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
              position={[0.863, 1.275, -2.471]}
              userData={{ name: '柱体.001' }}
            />
            <group
              name='立方体017'
              position={[-1.945, 0.513, -0.16]}
              userData={{ name: '立方体.017' }}
              ref={padRef}
            >
              <mesh
                name='立方体022'
                castShadow
                receiveShadow
                geometry={nodes.立方体022.geometry}
                material={materials.ipad}
              />
              <mesh
                name='立方体022_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体022_1.geometry}
                material={materials.ipadscreen}
              >
                <MyHtml
                  targetRef={padRef}
                  visible={isDelayFocusPad}
                  onClose={toggleFocusPad}
                  widthScale={0.6}
                  heightScale={0.8}
                />
              </mesh>
            </group>
            <mesh
              name='立方体018'
              castShadow
              receiveShadow
              geometry={nodes.立方体018.geometry}
              material={materials.booklet}
              position={[-2.03, 1.046, -2.029]}
              userData={{ name: '立方体.018' }}
            />
            <mesh
              name='立方体019'
              castShadow
              receiveShadow
              geometry={nodes.立方体019.geometry}
              material={materials.calendar}
              position={[-1.267, 1.582, -2.267]}
              userData={{ name: '立方体.019' }}
              onClick={toggleFocusCalendar}
              ref={calendarRef}
            />
            <mesh
              name='文本'
              castShadow
              receiveShadow
              geometry={nodes.文本.geometry}
              material={materials.材质}
              position={[-1.264, 1.761, -2.284]}
              rotation={[Math.PI / 2, 0, -Math.PI / 2]}
              scale={0.086}
              userData={{ name: '文本' }}
            />
            <mesh
              name='平面001'
              castShadow
              receiveShadow
              geometry={nodes.平面001.geometry}
              material={nodes.平面001.material}
              position={[0, 0.545, -2]}
              scale={0.32}
              userData={{ name: '平面.001' }}
            />
            <mesh
              name='立方体020'
              castShadow
              receiveShadow
              geometry={nodes.立方体020.geometry}
              material={materials['材质.001']}
              position={[-2.258, 1.68, -1.137]}
              scale={[0.098, 0.145, 0.024]}
              userData={{ name: '立方体.020' }}
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
              ref={chairRef}
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
                name='立方体012_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体012_1.geometry}
                material={materials.floor}
              />
              <mesh
                name='立方体012_2'
                castShadow
                receiveShadow
                geometry={nodes.立方体012_2.geometry}
                material={materials.floor_inner}
              />
            </group>
            <mesh
              name='立方体002'
              castShadow
              receiveShadow
              geometry={nodes.立方体002.geometry}
              material={materials.sofa}
              position={[-2.105, 0.268, 0.066]}
              userData={{ name: '立方体.002' }}
            >
              <group
                name='骨架001'
                position={[0.286, -0.086, -0.574]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={0.365}
                userData={{ name: '骨架.001' }}
                onClick={toggleFocusPad}
              >
                <primitive object={nodes.骨骼_1} />
              </group>
            </mesh>
            <group
              name='立方体004'
              position={[0.616, 0.6, -2.051]}
              rotation={[Math.PI, 0, Math.PI]}
              userData={{ name: '立方体.004' }}
              onClick={toggleFocusPhone}
              ref={phoneRef}
            >
              <mesh
                name='立方体014_1'
                castShadow
                receiveShadow
                geometry={nodes.立方体014_1.geometry}
                material={materials.phone}
              />
              <mesh
                name='立方体014_2'
                castShadow
                receiveShadow
                geometry={nodes.立方体014_2.geometry}
                material={materials.phonescreenimage}
              >
                <MyHtml
                  targetRef={phoneRef}
                  visible={isDelayFocusPhone}
                  onClose={toggleFocusPhone}
                />
              </mesh>
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
