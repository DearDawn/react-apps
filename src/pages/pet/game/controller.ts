import * as PIXI from 'pixi6.js';

enum Key {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
  space = 'space',
}

const keyMap = {
  Space: Key.space,
  KeyW: Key.up,
  ArrowUp: Key.up,
  KeyA: Key.left,
  ArrowLeft: Key.left,
  KeyS: Key.down,
  ArrowDown: Key.down,
  KeyD: Key.right,
  ArrowRight: Key.right,
};

export class Controller {
  app: PIXI.Application;
  keys: Record<Key, { pressed: boolean; timestamp: number }>;
  constructor({ app }) {
    this.app = app;

    this.keys = {
      up: { pressed: false, timestamp: 0 },
      left: { pressed: false, timestamp: 0 },
      down: { pressed: false, timestamp: 0 },
      right: { pressed: false, timestamp: 0 },
      space: { pressed: false, timestamp: 0 },
    };

    window.addEventListener('keydown', (event) => this.keydownHandler(event));
    window.addEventListener('keyup', (event) => this.keyupHandler(event));
    this.app.view.addEventListener('click', () => this.clickHandler());
    this.app.view.addEventListener('touchstart', () => this.clickHandler());
  }

  keydownHandler(event) {
    const key = keyMap[event.code];

    if (!key || !this.app.ticker.started) return;

    this.keys[key].pressed = true;
  }

  keyupHandler(event) {
    const key = keyMap[event.code];

    if (!key || !this.app.ticker.started) return;

    this.keys[key].pressed = false;
  }

  clickHandler() {
    if (!this.app.ticker.started) return;

    this.keys.space.pressed = true;

    setTimeout(() => {
      this.keys.space.pressed = false;
    }, 100);
  }
}
