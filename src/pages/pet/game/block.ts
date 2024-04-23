import { getRandom } from '@/utils';
import * as PIXI from 'pixi6.js';

export class Obstacle {
  app: PIXI.Application;
  sprite: PIXI.Graphics;
  speed = 5;
  static obstacles: Obstacle[] = [];

  constructor({ app }) {
    this.app = app;
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x000000);
    this.sprite.drawRect(0, 0, getRandom(40, 55), getRandom(20, 100));
    this.sprite.endFill();
    this.sprite.x = this.app.screen.width;
    this.sprite.y = this.app.screen.height - 330 - this.sprite.height;
    app.stage.addChild(this.sprite);
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
}
