import { useRef, useEffect, useState, useCallback, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFocus, useGltfLoader } from '../../hooks';
import { useAnimations } from '@react-three/drei';
import DebugBoundingBox from './debugBox';
import { MyHtml } from './myHtml';
import { GLTFResult } from './type';
import { GameContext } from '../scene';

export const Model = (props) => {
  const gltf = useGltfLoader<GLTFResult>('/public/models/3.0/room_v19.glb');
  const { camera } = useThree();
  const { setSceneReady } = useContext(GameContext);
  const { nodes, materials, animations } = gltf || {};
  const [scaleRatio, setScaleRatio] = useState(1);

  const group = useRef<THREE.Object3D>();
  const pcRef = useRef<THREE.Mesh>();
  const phoneRef = useRef<THREE.Mesh>();
  const calendarRef = useRef<THREE.Mesh>();
  const chairRef = useRef<THREE.Mesh>();
  const padRef = useRef<THREE.Group>();
  const bookRef = useRef<THREE.Mesh>();
  const figureRef = useRef<THREE.Mesh>();
  const boardRef = useRef<THREE.Mesh>();
  const mixerRef = useRef<THREE.AnimationMixer>();
  const { actions } = useAnimations(animations, group);

  const { toggleFocus, endFocus, isDelayFocus } = useFocus({
    camera,
    targetRef: pcRef,
    offset: new THREE.Vector3(0, 0, 4),
    duration: 500,
    onStart: (_isFocus) => {
      setTimeout(() => handlePlayAnimation(_isFocus), _isFocus ? 0 : 100);
    },
  });

  const { toggleFocus: toggleFocusPhone, isDelayFocus: isDelayFocusPhone } =
    useFocus({
      camera,
      targetRef: phoneRef,
      offset: new THREE.Vector3(0, 1 * scaleRatio, 0),
      midPointsOffset: [{ x: 0, y: 3, z: Number.NEGATIVE_INFINITY }],
    });

  const { toggleFocus: toggleFocusCalendar } = useFocus({
    camera,
    targetRef: calendarRef,
    offset: new THREE.Vector3(3 * scaleRatio, 0, 0),
    duration: 500,
  });

  const { toggleFocus: toggleFocusPad } = useFocus({
    camera,
    targetRef: padRef,
    offset: new THREE.Vector3(0, 0.3, -0.5),
    midPointsOffset: [{ x: 5, y: 5, z: -5 }],
  });

  const { toggleFocus: toggleFocusBook } = useFocus({
    camera,
    targetRef: bookRef,
    offset: new THREE.Vector3(0, 0, 6 * scaleRatio),
  });

  const { toggleFocus: toggleFocusFigure } = useFocus({
    camera,
    targetRef: figureRef,
    offset: new THREE.Vector3(6 * scaleRatio, 0, 0),
  });

  const { toggleFocus: toggleFocusBoard, isDelayFocus: isDelayFocusBoard } =
    useFocus({
      camera,
      targetRef: boardRef,
      offset: new THREE.Vector3(4, 0, 0),
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

    actions['骨架.001动作'].play();

    const lookAtPos = chairRef.current.getWorldPosition(new THREE.Vector3());
    camera.lookAtPoint = lookAtPos.clone().add(new THREE.Vector3(0, 2.5, 0));
    camera.currentLookAtPoint = camera.lookAtPoint.clone();
    camera.lookAt(camera.lookAtPoint);

    setSceneReady((_cnt) => _cnt + 1);
  }, [actions, camera, gltf, setSceneReady]);

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
      <DebugBoundingBox targetRef={pcRef} />
      <group name='Scene'>
        <group name='Scene_Collection' userData={{ name: 'Scene Collection' }}>
          <group name='Collection' userData={{ name: 'Collection' }}>
            {/* <mesh
              name='墙体'
              castShadow
              receiveShadow
              geometry={nodes.墙体.geometry}
              material={materials.墙体}
              userData={{ name: '墙体' }}
            /> */}
            <mesh
              name='书桌'
              castShadow
              receiveShadow
              geometry={nodes.书桌.geometry}
              material={materials.书桌}
              position={[0, 0.545, -2]}
              scale={[0.667, 0.5, 0.5]}
              userData={{ name: '书桌' }}
            >
              <group
                name='手机'
                position={[0.924, 0.111, -0.101]}
                rotation={[Math.PI, 0, Math.PI]}
                scale={[1.5, 2, 2]}
                userData={{ name: '手机' }}
                onClick={toggleFocusPhone}
              >
                <mesh
                  name='手机_1'
                  castShadow
                  receiveShadow
                  geometry={nodes.手机_1.geometry}
                  material={materials.手机}
                />
                <mesh
                  name='手机_2'
                  castShadow
                  receiveShadow
                  geometry={nodes.手机_2.geometry}
                  material={materials.手机屏保}
                  ref={phoneRef}
                >
                  <MyHtml
                    targetRef={phoneRef}
                    visible={isDelayFocusPhone}
                    onClose={toggleFocusPhone}
                    src='https://dododawn.com/react-apps/'
                  />
                </mesh>
              </group>
              <mesh
                name='桌腿'
                castShadow
                receiveShadow
                geometry={nodes.桌腿.geometry}
                material={materials.桌腿}
                position={[-1.291, -0.59, 0.7]}
                userData={{ name: '桌腿' }}
              />
              <group
                name='电脑'
                position={[0, 1.023, -0.754]}
                scale={[1.5, 2, 2]}
                userData={{ name: '电脑' }}
                onClick={toggleFocus}
              >
                <mesh
                  name='电脑_1'
                  castShadow
                  receiveShadow
                  geometry={nodes.电脑_1.geometry}
                  material={materials.电脑}
                />
                <mesh
                  name='电脑_2'
                  castShadow
                  receiveShadow
                  geometry={nodes.电脑_2.geometry}
                  material={materials.电脑屏幕}
                  ref={pcRef}
                />
                <mesh
                  name='电脑屏幕'
                  castShadow
                  receiveShadow
                  geometry={nodes.电脑屏幕.geometry}
                  material={materials.电脑屏保}
                  position={[0, 0.032, 0]}
                  scale={0.964}
                  userData={{ name: '电脑屏幕' }}
                >
                  <MyHtml
                    targetRef={pcRef}
                    visible={isDelayFocus}
                    onClose={endFocus}
                  />
                </mesh>
              </group>
              <group
                name='触控板'
                position={[0.496, 0.114, -0.194]}
                scale={[1.195, 1.593, 1.593]}
                userData={{ name: '触控板' }}
              >
                <mesh
                  name='触控板_1'
                  castShadow
                  receiveShadow
                  geometry={nodes.触控板_1.geometry}
                  material={materials.触控板}
                />
                <mesh
                  name='触控板_2'
                  castShadow
                  receiveShadow
                  geometry={nodes.触控板_2.geometry}
                  material={materials.触控板玻璃}
                />
              </group>
              <mesh
                name='键盘'
                castShadow
                receiveShadow
                geometry={nodes.键盘.geometry}
                material={materials.键盘}
                position={[-0.111, 0.134, -0.194]}
                scale={[1.5, 2, 2]}
                userData={{ name: '键盘' }}
              >
                <mesh
                  name='_键帽001'
                  castShadow
                  receiveShadow
                  geometry={nodes._键帽001.geometry}
                  material={materials.键帽}
                  position={[-0.238, 0.011, -0.061]}
                  userData={{ name: ' 键帽.001' }}
                />
              </mesh>
            </mesh>
            <group
              name='平板'
              position={[-1.945, 0.513, -0.16]}
              userData={{ name: '平板' }}
              ref={padRef}
            >
              <mesh
                name='平板_1'
                castShadow
                receiveShadow
                geometry={nodes.平板_1.geometry}
                material={materials.平板}
              />
              <mesh
                name='平板_2'
                castShadow
                receiveShadow
                geometry={nodes.平板_2.geometry}
                material={materials.平板屏幕}
              />
            </group>
            <mesh
              name='柜子'
              castShadow
              receiveShadow
              geometry={nodes.柜子.geometry}
              material={materials.柜子}
              position={[-2.03, 1.046, -2.029]}
              userData={{ name: '柜子' }}
            >
              <mesh
                name='书架'
                castShadow
                receiveShadow
                geometry={nodes.书架.geometry}
                material={materials.书架}
                position={[0.674, 0.634, -0.321]}
                userData={{ name: '书架' }}
                ref={bookRef}
                onClick={toggleFocusBook}
              />
              <mesh
                name='手办'
                castShadow
                receiveShadow
                geometry={nodes.手办.geometry}
                material={materials.手办}
                position={[-0.257, 0.615, 0.79]}
                userData={{ name: '手办' }}
                ref={figureRef}
                onClick={toggleFocusFigure}
              />
              <mesh
                name='日历'
                castShadow
                receiveShadow
                geometry={nodes.日历.geometry}
                material={materials.日历}
                position={[0.764, 0.536, -0.238]}
                userData={{ name: '日历' }}
                onClick={toggleFocusCalendar}
                ref={calendarRef}
              >
                <mesh
                  name='文本'
                  castShadow
                  receiveShadow
                  geometry={nodes.文本.geometry}
                  material={materials.标题}
                  position={[0.002, 0.179, -0.017]}
                  rotation={[Math.PI / 2, 0, -Math.PI / 2]}
                  scale={0.086}
                  userData={{ name: '文本' }}
                />
              </mesh>
            </mesh>
            <group
              name='留言板'
              position={[-2.47, 1.385, 0.08]}
              userData={{ name: '留言板' }}
            >
              <mesh
                name='_留言板'
                castShadow
                receiveShadow
                geometry={nodes._留言板.geometry}
                material={materials.柜子}
              />
              <mesh
                name='_留言板_1'
                castShadow
                receiveShadow
                geometry={nodes._留言板_1.geometry}
                material={materials.留言板}
                ref={boardRef}
                onClick={toggleFocusBoard}
              >
                <MyHtml
                  targetRef={boardRef}
                  visible={isDelayFocusBoard}
                  onClose={toggleFocusBoard}
                  borderRadius='0'
                  src='https://dododawn.com/message2/'
                />
              </mesh>
              <mesh
                name='贴纸'
                castShadow
                receiveShadow
                geometry={nodes.贴纸.geometry}
                material={materials.便利贴}
                position={[0.029, 0.224, 0.417]}
                rotation={[0, 0, -Math.PI / 2]}
                scale={0.096}
                userData={{ name: '贴纸' }}
              />
              <mesh
                name='贴纸001'
                castShadow
                receiveShadow
                geometry={nodes.贴纸001.geometry}
                material={materials.便利贴}
                position={[0.029, 0.077, 0.161]}
                rotation={[0, 0, -Math.PI / 2]}
                scale={0.096}
                userData={{ name: '贴纸.001' }}
              />
              <mesh
                name='贴纸002'
                castShadow
                receiveShadow
                geometry={nodes.贴纸002.geometry}
                material={materials.便利贴}
                position={[0.029, 0.186, -0.111]}
                rotation={[0, 0, -Math.PI / 2]}
                scale={0.096}
                userData={{ name: '贴纸.002' }}
              />
              <mesh
                name='贴纸003'
                castShadow
                receiveShadow
                geometry={nodes.贴纸003.geometry}
                material={materials.便利贴}
                position={[0.029, -0.077, -0.297]}
                rotation={[0, 0, -Math.PI / 2]}
                scale={0.096}
                userData={{ name: '贴纸.003' }}
              />
            </group>
            <mesh
              name='CD机'
              castShadow
              receiveShadow
              geometry={nodes.CD机.geometry}
              material={materials.书桌}
              position={[0.863, 1.746, -2.46]}
              userData={{ name: 'CD机' }}
            >
              <mesh
                name='CD拉绳'
                castShadow
                receiveShadow
                geometry={nodes.CD拉绳.geometry}
                material={materials.书桌}
                position={[0, -0.471, -0.011]}
                userData={{ name: 'CD拉绳' }}
              />
              <mesh
                name='唱片'
                castShadow
                receiveShadow
                geometry={nodes.唱片.geometry}
                material={materials.唱片}
                position={[0, 0, 0.003]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.108}
                userData={{ name: '唱片' }}
              />
            </mesh>
            <group name='地毯' userData={{ name: '地毯' }}>
              <mesh
                name='地毯_1'
                castShadow
                receiveShadow
                geometry={nodes.地毯_1.geometry}
                material={materials.地毯白}
              />
              <mesh
                name='地毯_2'
                castShadow
                receiveShadow
                geometry={nodes.地毯_2.geometry}
                material={materials.地毯黄}
              />
            </group>
          </group>
          <group name='Body' userData={{ name: 'Body' }}>
            <mesh
              name='椅子'
              castShadow
              receiveShadow
              geometry={nodes.椅子.geometry}
              material={materials.书桌}
              position={[0.008, 0.399, -1.102]}
              userData={{ name: '椅子' }}
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
            <mesh
              name='沙发'
              castShadow
              receiveShadow
              geometry={nodes.沙发.geometry}
              material={materials.沙发}
              position={[-2.105, 0.268, 0.066]}
              userData={{ name: '沙发' }}
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
          </group>
        </group>
      </group>
    </group>
  );
};
