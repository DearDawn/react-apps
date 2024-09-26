import React from 'react';
import { Mesh, Vector3 } from 'three';

export class Tower {
  position: Vector3;
  health: number;
  defense: number;
  attack: number;
  soldierCapacity: number;
  meshRef: React.RefObject<Mesh>;
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
    this.attack = attack;
    this.soldierCapacity = soldierCapacity;
    this.meshRef = React.createRef<Mesh>();
  }

  takeDamage(damage: number): void {
    const actualDamage = damage - this.defense;
    this.health -= actualDamage;
    console.log('[dodo] ', '血量 tower', this.health);
    if (this.health <= 0) {
      this.die();
    }
  }
  die() {
    console.log('[dodo] ', 'tower die');
    // Implement death logic here
  }
}
