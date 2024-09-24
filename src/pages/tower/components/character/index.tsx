import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box3 } from 'three';
import { Text } from '@react-three/drei';

export const Character = ({
  position,
  bodyRef,
  weaponRef,
  weaponWrapRef,
  onCollision,
  isHit,
}) => {
  const [weaponAngle, setWeaponAngle] = useState(0);

  useFrame(() => {
    // 简单的挥砍动画
    if (weaponWrapRef.current) {
      const angle = (Math.sin(Date.now() * 0.005) * Math.PI) / 2;
      weaponWrapRef.current.rotation.z = angle;
      setWeaponAngle(angle);
    }

    // 碰撞检测
    if (bodyRef.current && weaponRef.current) {
      const weaponBox = new Box3().setFromObject(weaponRef.current);
      onCollision(weaponBox);
    }
  });

  return (
    <group position={position}>
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isHit ? 'red' : 'blue'} />
      </mesh>
      <group
        ref={weaponWrapRef}
        position={[0, 0, -0.5]}
        rotation-z={weaponAngle}
      >
        <mesh ref={weaponRef} position={[0, 1.5, 0]}>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshStandardMaterial color='green' />
        </mesh>
      </group>
    </group>
  );
};

export const CharacterWrap = () => {
  const [hitCount, setHitCount] = useState(0);
  const [characters, setCharacters] = useState([
    {
      position: [-2, 0, 0],
      bodyRef: useRef(),
      weaponRef: useRef(),
      weaponWrapRef: useRef(),
      isHit: false,
    },
    {
      position: [2, 0, 0],
      bodyRef: useRef(),
      weaponRef: useRef(),
      weaponWrapRef: useRef(),
      isHit: false,
    },
  ]);

  const handleCollision = (index, weaponBox) => {
    const updatedCharacters = characters.map((character, i) => {
      if (i !== index && character.bodyRef.current) {
        const otherBodyBox = new Box3().setFromObject(
          character.bodyRef.current
        );

        if (weaponBox.intersectsBox(otherBodyBox)) {
          if (!character.isHit) {
            character.isHit = true;
            setHitCount((prev) => prev + 1);
          }
        } else {
          character.isHit = false;
        }
      }
      return character;
    });

    setCharacters(updatedCharacters);
  };

  return (
    <group position={[10, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {characters.map((character, index) => (
        <Character
          key={index}
          isHit={character.isHit}
          position={character.position}
          bodyRef={character.bodyRef}
          weaponRef={character.weaponRef}
          weaponWrapRef={character.weaponWrapRef}
          onCollision={(weaponBox) => handleCollision(index, weaponBox)}
        />
      ))}
      <Text position={[0, 2, 0]} fontSize={0.5} color='black'>
        Hits: {hitCount}
      </Text>
    </group>
  );
};
