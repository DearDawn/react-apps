import { Character } from './character';
import * as THREE from 'three';

export default class Enemy extends Character {
  targetEnemy: Character | null;

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
    super({ position, health, defense, attack, attackSpeed, moveSpeed, id });
    this.targetEnemy = null;
  }
}
