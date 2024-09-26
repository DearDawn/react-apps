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
  id: string;
  meshRef: React.RefObject<THREE.Mesh>;
  attackLock: boolean;
  moveLock: boolean;
  moving: boolean;
  attacking: boolean;
  alive: boolean;
  target: Character | Tower | null;

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
    this.moving = false;
    this.attacking = false;
    this.alive = true;
    this.moveLock = false;
    this.attackLock = false;
    this.range = 1;
    this.target = null;
  }

  stopMove() {
    this.moving = false;
    this.moveLock = true;
  }

  continueMove() {
    this.moveLock = false;
    this.attacking = false;
  }

  setTarget(target: Character | Tower) {
    this.target = target;
  }

  moveTo(target: Character | Tower, cb?: () => void) {
    this.target = target || this.target;
    this.moving = true;

    if (this.moveLock) return;

    if (this.meshRef.current && this.target) {
      const direction = new THREE.Vector3()
        .subVectors(this.target.position, this.meshRef.current.position)
        .normalize();
      this.meshRef.current.position.add(
        direction.multiplyScalar(this.moveSpeed)
      );
      this.position.copy(this.meshRef.current.position);

      const distanceToTarget = this.meshRef.current.position.distanceTo(
        this.target.position
      );

      if (distanceToTarget < this.target.range) {
        cb?.();
      }
    }
  }

  move(cb?: () => void) {
    this.moveTo(this.target, cb);
  }

  attackTarget(target?: Character | Tower): void {
    this.target = target || this.target;
    this.attacking = true;

    this.stopMove();
    if (this.attackLock) return;

    this.attackLock = true;

    if (!this.target.alive) {
      this.continueMove();
      return;
    }

    this.target.takeDamage(this, this.attack);

    setTimeout(() => {
      this.attackLock = false;
    }, this.attackSpeed);
  }

  takeDamage(source: Character, damage: number): void {
    this.attackTarget(source);
    this.playInjureAnimation();
    const actualDamage = damage - this.defense;
    this.health -= actualDamage;
    console.log('[dodo] ', '血量', this.id, this.health);
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
    console.log('[dodo] ', 'die');
    this.alive = false;
    this.afterDie();
  }

  afterDie() {}

  onDeath(cb: () => void): void {
    this.afterDie = cb;
  }
}
