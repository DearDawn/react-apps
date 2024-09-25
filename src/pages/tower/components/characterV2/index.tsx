import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box3, Group, Vector3 } from 'three';
import { Text } from '@react-three/drei';

export const Character = ({ index, character, onCollision, onMove }) => {
  const {
    isHit,
    isAttacking,
    position,
    targetPosition,
    bodyRef,
    weaponRef,
    weaponWrapRef,
    characterRef,
  } = character;
  const [weaponAngle, setWeaponAngle] = useState(0);

  useEffect(() => {
    // 随机移动
    const interval = setInterval(() => {
      const newTarget = new Vector3(
        Math.floor(Math.random() * 4 - 2),
        0,
        Math.floor(Math.random() * 4 - 2)
      );

      onMove(index, newTarget);
    }, 2000);

    return () => clearInterval(interval);
  }, [index, onMove]);

  useFrame(() => {
    // 简单的挥砍动画
    if (weaponWrapRef.current && isAttacking) {
      const angle = (Math.sin(Date.now() * 0.005) * Math.PI) / 2;
      weaponWrapRef.current.rotation.z = angle;
      setWeaponAngle(angle);
    }

    // 碰撞检测
    if (bodyRef.current && weaponRef.current) {
      const weaponBox = new Box3().setFromObject(weaponRef.current);
      onCollision(weaponBox, bodyRef);
    }

    // 移动角色
    if (characterRef.current) {
      const direction = targetPosition
        .clone()
        .sub(characterRef.current.position)
        .normalize();
      characterRef.current.position.add(direction.multiplyScalar(0.05));
    }
  });

  return (
    <group ref={characterRef} position={position}>
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isHit ? 'red' : 'green'} />
      </mesh>
      <group ref={weaponWrapRef} position={[0, 0, 0]} rotation-z={weaponAngle}>
        <mesh ref={weaponRef} position={[0, 1.5, 0]}>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshStandardMaterial color='green' />
        </mesh>
      </group>
    </group>
  );
};

export const CharacterWrapV2 = () => {
  const [hitCount, setHitCount] = useState(0);
  const [characters, setCharacters] = useState([
    {
      position: new Vector3(-5, 0, 0),
      targetPosition: new Vector3(-5, 0, 0),
      characterRef: useRef<Group>(),
      bodyRef: useRef(),
      weaponRef: useRef(),
      weaponWrapRef: useRef(),
      isHit: false,
      isAttacking: false,
    },
    {
      position: new Vector3(5, 0, 0),
      targetPosition: new Vector3(5, 0, 0),
      characterRef: useRef<Group>(),
      bodyRef: useRef(),
      weaponRef: useRef(),
      weaponWrapRef: useRef(),
      isHit: false,
      isAttacking: false,
    },
  ]);

  const handleCollision = (index, weaponBox) => {
    const itsCharacter = characters[index].characterRef.current;
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

        const distance = itsCharacter.position.distanceTo(
          character.characterRef.current.position
        );

        character.isAttacking = distance < 3;
      }
      return character;
    });

    setCharacters(updatedCharacters);
  };

  const handleMove = useCallback((index, targetPosition) => {
    setCharacters((_characters) =>
      _characters.map((character, i) => {
        if (i === index) {
          character.targetPosition = targetPosition;
        }
        return character;
      })
    );
  }, []);

  return (
    <group position={[10, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {characters.map((character, index) => (
        <Character
          index={index}
          key={index}
          character={character}
          onCollision={(weaponBox) => handleCollision(index, weaponBox)}
          onMove={handleMove}
        />
      ))}
      <Text position={[0, 2, 0]} fontSize={0.5} color='black'>
        Hits: {hitCount}
      </Text>
    </group>
  );
};
