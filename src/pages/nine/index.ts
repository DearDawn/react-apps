import * as PIXI from 'pixi.js';
import './styles.less'

const app = new PIXI.Application({ background: '#1099bb', resizeTo: window });

document.body.appendChild(app.view as unknown as Node);

// create a new Sprite from an image path
const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png');

// center the sprite's anchor point
bunny.anchor.set(0.5);
const { x, y } = bunny.position
bunny.position.set(x + 1, y + 1)

// move the sprite to the center of the screen
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;

app.stage.addChild(bunny);

// 创建一个键盘按键状态对象
const keys = {
  ArrowLeft: false,
  ArrowUp: false,
  ArrowRight: false,
  ArrowDown: false
};

// 监听键盘按键按下和松开事件
window.addEventListener('keydown', (event) => {
  const key = event.key;

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key;

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = false;
  }
});

// Listen for animate update
app.ticker.add((delta) => {
  // just for fun, let's rotate mr rabbit a little
  // delta is 1 if running at 100% performance
  // creates frame-independent transformation
  // 根据键盘按键状态来移动精灵
  if (keys.ArrowLeft) {
    bunny.x -= 2;
  }

  if (keys.ArrowUp) {
    bunny.y -= 2;
  }

  if (keys.ArrowRight) {
    bunny.x += 2;
  }

  if (keys.ArrowDown) {
    bunny.y += 2;
  }

  bunny.rotation += 0.1 * delta;
});
