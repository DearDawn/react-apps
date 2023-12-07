import * as PIXI from 'pixi.js';
export class Bunny {
  bunny: PIXI.Sprite;
  rate = 4;
  targetX = 0;
  targetY = 0;
  constructor (x, y) {
    // create a new Sprite from an image path
    this.bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png');
    this.bunny.width = 27 * 2;
    this.bunny.height = 39 * 2;
    // move the sprite to the center of the screen
    this.bunny.x = x;
    this.bunny.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  move (dir: 'left' | 'right' | 'up' | 'down', delta = 1) {
    switch (dir) {
      case 'left':
        this.bunny.x -= this.rate * delta;
        break;
      case 'right':
        this.bunny.x += this.rate * delta;
        break;
      case 'up':
        this.bunny.y -= this.rate * delta;
        break;
      case 'down':
        this.bunny.y += this.rate * delta;
        break;
      default:
        break;
    }
  }

  autoMove (delta = 1) {
    const xDiff = this.targetX - this.bunny.x;
    const yDiff = this.targetY - this.bunny.y;

    this.bunny.x += Math.min(this.rate * delta, Math.abs(xDiff)) * (xDiff >= 0 ? 1 : -1);
    this.bunny.y += Math.min(this.rate * delta, Math.abs(yDiff)) * (yDiff >= 0 ? 1 : -1);
  }

  get obj () {
    return this.bunny;
  }

  get position () {
    return { x: this.bunny.x, y: this.bunny.y };
  }

  get needMove () {
    const isStatic = this.bunny.x === this.targetX && this.bunny.y === this.targetY;
    return !isStatic;
  }

  setPos ({ x, y }) {
    this.bunny.x = x;
    this.bunny.y = y;
    this.targetX = x;
    this.targetY = y;
  }
  setTargetPos ({ x, y }) {
    this.targetX = x;
    this.targetY = y;
  }
}
