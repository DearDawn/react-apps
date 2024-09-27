import React from 'react';
import * as THREE from 'three';
import { Tower } from './tower';

export class Character {
  position: THREE.Vector3;
  health: number;
  defense: number;
  attack: number;
  attackSpeed: number;
  moveSpeed: number;
  range: number;
  score: number;
  id: string;
  meshRef: React.RefObject<THREE.Mesh>;
  attackLock: boolean;
  moveLock: boolean;
  alive: boolean;
  target: Character | Tower | null;
  status: 'attack' | 'move' | 'static';

  constructor(props: {
    position: THREE.Vector3;
    health: number;
    defense: number;
    attack: number;
    attackSpeed: number;
    moveSpeed: number;
    id: string;
  }) {
    const { position, health, defense, attack, attackSpeed, moveSpeed, id } =
      props;
    this.position = position;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.attackSpeed = attackSpeed;
    this.moveSpeed = moveSpeed;
    this.id = id || Math.random().toString();
    this.meshRef = React.createRef<THREE.Mesh>();
    this.alive = true;
    this.moveLock = false;
    this.attackLock = false;
    this.range = 1;
    this.target = null;
    this.status = 'static';
    this.score = 0;
  }

  stopMove() {
    this.moveLock = true;
  }

  continueMove() {
    this.status = 'move';
  }

  setTarget(target: Character | Tower) {
    this.target = target;
  }

  moveTo(target: Character | Tower, cb?: () => void) {
    this.target = target || this.target;
    this.status = 'move';

    if (this.meshRef.current && this.target) {
      const direction = new THREE.Vector3()
        .subVectors(this.target.position, this.meshRef.current.position)
        .normalize();
      this.meshRef.current.position.add(
        direction.multiplyScalar(this.moveSpeed)
      );
      this.position.copy(this.meshRef.current.position);

      const distanceToTarget = this.getDistanceToTarget();

      // console.log('[dodo] ', '距离', distanceToTarget);
      if (distanceToTarget < this.target.range) {
        cb?.();
      }
    }
  }

  getDistanceToTarget(target: Character | Tower = this.target): number {
    return this.position.distanceTo(target.position);
  }

  move(cb?: () => void) {
    this.moveTo(this.target, cb);
  }

  attackTarget(target?: Character | Tower): void {
    // console.log('[dodo] ', '攻击', target?.id);
    this.target = target || this.target;

    this.status = 'attack';
    this.stopMove();

    if (this.id === 'hero') {
      console.log('[dodo] ', 'this.life', this.health);
    }

    if (this.attackLock) return;

    this.attackLock = true;

    setTimeout(() => {
      this.attackLock = false;
    }, this.attackSpeed);


    const distanceToTarget = this.getDistanceToTarget();

    // console.log('[dodo] ', '距离', distanceToTarget);
    if (distanceToTarget >= this.target.range) {
      this.continueMove();
      return;
    }

    if (!this.target || !this.target.alive) {
      this.score += 1;
      this.target = null;
      this.continueMove();
    }

    this.target?.takeDamage(this, this.attack);
  }

  takeDamage(source: Character, damage: number): void {
    this.attackTarget(source);
    this.playInjureAnimation();
    const actualDamage = damage - this.defense;
    this.health -= actualDamage;
    // console.log('[dodo] ', '血量', this.id, this.health);
    if (this.health <= 0) {
      this.die();
    }
  }

  playInjureAnimation(): void {
    const material = this.meshRef.current.material as THREE.MeshBasicMaterial;

    material.color.set('red');
    setTimeout(() => {
      material.color.set('yellow');
    }, 200);
  }

  die(): void {
    // Implement death logic here
    // console.log('[dodo] ', 'die');
    this.alive = false;
    this.afterDie();
  }

  afterDie() {}

  onDeath(cb: () => void): void {
    this.afterDie = cb;
  }
}
