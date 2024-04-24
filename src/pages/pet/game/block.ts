import { getRandom } from '@/utils';
import * as PIXI from 'pixi6.js';

export class Obstacle {
  app: PIXI.Application;
  sprite: PIXI.Graphics;
  level: number;
  initSpeed = 5;
  static obstacles: Obstacle[] = [];

  constructor({ app, level }) {
    this.app = app;
    this.level = level;
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x000000);
    this.sprite.drawRect(0, 0, getRandom(40, 55), getRandom(25, 100));
    this.sprite.endFill();
    this.sprite.x = this.app.screen.width;
    this.sprite.y = this.app.screen.height - 330 - this.sprite.height;
    app.stage.addChild(this.sprite);
  }

  get speed() {
    return this.level * this.initSpeed;
  }

  update(delta) {
    this.sprite.x -= this.speed * delta;
  }

  isOutOfScreen() {
    return this.sprite.x + this.sprite.width < 0;
  }

  remove() {
    this.app.stage.removeChild(this.sprite);
  }

  static clear() {
    Obstacle.obstacles.forEach((it) => it.remove());
    Obstacle.obstacles = [];
  }
}
