import * as PIXI from 'pixi.js';
import { Bubble } from './bubble';
import BunnyImg from '@/assets/bunny.png';

export class Bunny {
  bunny: PIXI.Sprite;
  bubble: Bubble | null;
  bubbleTimer = 0;
  rate = 4;
  targetX = 0;
  targetY = 0;
  constructor (x, y) {
    // create a new Sprite from an image path
    this.bunny = PIXI.Sprite.from(BunnyImg);
    this.bunny.width = 27;
    this.bunny.height = 39;
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

    this.bunny.x +=
      Math.min(this.rate * delta, Math.abs(xDiff)) * (xDiff >= 0 ? 1 : -1);
    this.bunny.y +=
      Math.min(this.rate * delta, Math.abs(yDiff)) * (yDiff >= 0 ? 1 : -1);
  }

  initBubble () {
    if (!this.bubble) {
      // 创建跟随气泡的容器
      this.bubble = new Bubble(this.obj.width, -this.obj.height / 2 - 10);
      this.bubble.onDestroy(() => {
        this.obj.removeChild(this.bubble.obj);
        this.bubble = null;
      });
      // 将跟随气泡容器添加到精灵中
      this.obj.addChild(this.bubble.obj);
    }
  }

  say (text = '') {
    this.initBubble();
    this.bubble.setText(text);
  }

  typing () {
    this.initBubble();
    this.bubble.showLoading();
  }

  visible (visible = false) {
    this.bunny.alpha = visible ? 1 : 0.5;
  }

  get obj () {
    return this.bunny;
  }

  get position () {
    return { x: this.bunny.x, y: this.bunny.y };
  }

  get needMove () {
    const isStatic =
      this.bunny.x === this.targetX && this.bunny.y === this.targetY;
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
