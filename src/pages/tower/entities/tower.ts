import React from 'react';
import { Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Character } from './character';

export class Tower {
  position: Vector3;
  health: number;
  defense: number;
  attack: number;
  range: number;
  soldierCapacity: number;
  alive: boolean;
  id: string;
  meshRef: React.RefObject<Mesh>;
  source: Character | Tower | null;
  constructor(props: {
    position: Vector3;
    health: number;
    defense: number;
    attack: number;
    soldierCapacity: number;
  }) {
    const { position, health, defense, attack, soldierCapacity } = props;
    this.position = position;
    this.health = health;
    this.defense = defense;
    this.alive = true;
    this.range = 2;
    this.attack = attack;
    this.id = 'tower';
    this.soldierCapacity = soldierCapacity;
    this.meshRef = React.createRef<Mesh>();
  }

  takeDamage(source: Character, damage: number): void {
    this.playInjureAnimation();

    const actualDamage = damage - this.defense;
    this.health -= actualDamage;
    console.log('[dodo] ', '血量 tower', this.health);
    if (this.health <= 0) {
      this.die();
    }
  }

  playInjureAnimation(): void {
    const material = this.meshRef.current.material as MeshBasicMaterial;

    material.color.set('red');
    setTimeout(() => {
      material.color.set('gray');
    }, 200);
  }

  die() {
    console.log('[dodo] ', 'tower die');
    // Implement death logic here
    this.alive = false;
    this.afterDie();
  }

  afterDie() {}

  onDeath(cb: () => void): void {
    this.afterDie = cb;
  }
}
