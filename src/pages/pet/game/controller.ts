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
  keys: Record<Key, { pressed: boolean; timestamp: number }>;
  constructor() {
    this.keys = {
      up: { pressed: false, timestamp: 0 },
      left: { pressed: false, timestamp: 0 },
      down: { pressed: false, timestamp: 0 },
      right: { pressed: false, timestamp: 0 },
      space: { pressed: false, timestamp: 0 },
    };

    window.addEventListener('keydown', (event) => this.keydownHandler(event));
    window.addEventListener('keyup', (event) => this.keyupHandler(event));
  }

  keydownHandler(event) {
    const key = keyMap[event.code];

    if (!key) return;

    const now = Date.now();

    this.keys[key].pressed = true;
  }

  keyupHandler(event) {
    const key = keyMap[event.code];

    if (!key) return;

    this.keys[key].pressed = false;
  }
}
