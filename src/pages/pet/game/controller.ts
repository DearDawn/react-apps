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

const initMap = () => ({
  up: { pressed: false, timestamp: 0 },
  left: { pressed: false, timestamp: 0 },
  down: { pressed: false, timestamp: 0 },
  right: { pressed: false, timestamp: 0 },
  space: { pressed: false, timestamp: 0 },
});

export class Controller {
  app: PIXI.Application;
  enabled: boolean;
  keys: Record<Key, { pressed: boolean; timestamp: number }>;
  onSpace = () => {};
  constructor({ app, onSpace = () => {} }) {
    this.app = app;
    this.onSpace = onSpace;
    this.keys = initMap();
  }

  keydownHandler = (event) => {
    const key = keyMap[event.code];

    if (!key || !this.app.ticker.started) return;

    this.keys[key].pressed = true;
  };

  keyupHandler = (event) => {
    const key = keyMap[event.code];

    if (key === 'space') {
      this.onSpace?.();
    }

    if (!key || !this.app.ticker.started) return;

    this.keys[key].pressed = false;
  };

  clickHandler = () => {
    if (!this.app.ticker.started) return;

    this.keys.space.pressed = true;

    setTimeout(() => {
      this.keys.space.pressed = false;
    }, 100);
  };

  mount() {
    this.enabled = true;

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
    this.app.view.addEventListener('pointerdown', this.clickHandler);
  }

  destroy() {
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    this.app.view.removeEventListener('pointerdown', this.clickHandler);

    this.enabled = false;
    this.keys = initMap();
  }
}
