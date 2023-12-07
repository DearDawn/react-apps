import * as PIXI from 'pixi.js';
import './styles.less';
import { Bunny } from './Objects/bunny';
import io from 'socket.io-client';
import { isDev } from '@/utils';
import Bubble from '@/assets/bubble.png';

const app = new PIXI.Application({ background: '#1099bb', resizeTo: window });

document.body.appendChild(app.view as unknown as Node);

// create a new Sprite from an image path
const bunny = new Bunny(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(bunny.obj);
const otherBunny: Record<string, Bunny> = {};

// // 创建跟随气泡的容器
// const bubbleContainer = new PIXI.Container();

// // 创建跟随气泡的背景图像
// const bubbleBackground = new PIXI.Sprite(PIXI.Texture.from(Bubble));
// bubbleBackground.anchor.set(0.5, 1); // 设置锚点为底部中心
// bubbleBackground.y = -bunny.obj.height; // 设置背景图像相对于精灵的垂直位置
// bubbleContainer.addChild(bubbleBackground);

// // 创建跟随气泡中的文本
// const text = new PIXI.Text('Hello!', {
//   fontFamily: 'Arial',
//   fontSize: 16,
//   fill: 'black',
// });
// text.anchor.set(0.5, 1); // 设置锚点为底部中心
// text.y = -bunny.obj.height + 10; // 设置文本相对于精灵的垂直位置
// bubbleContainer.addChild(text);

// // 将跟随气泡容器添加到精灵中
// bunny.obj.addChild(bubbleContainer);

console.log('[dodo] ', 'isDev', isDev);

// 客户端代码
const socket = io(isDev ? 'http://localhost:9009' : `${location.origin}:9010`); // 连接到服务器的Socket.IO实例

// 发送控制精灵的请求
function controlSprite (data) {
  socket.emit('controlSprite', data);
}

// 监听更新精灵的消息
socket.on('moveSprite', (data) => {
  const { clientId, pos } = data;
  // 在这里更新精灵的状态
  otherBunny[clientId]?.setTargetPos(pos);
});

// 连接到服务器
socket.on('connect', () => {
  console.log('[dodo] ', 'Connected to server', socket.id);
  socket.emit('init');
});

socket.on('userIn', (data = {}) => {
  console.log('[dodo] ', 'userIn', data);
  const { clientId, pos } = data;
  const { x = app.screen.width / 2, y = app.screen.height / 2 } = pos || {};
  otherBunny[clientId] = new Bunny(x, y);
  otherBunny[clientId].setTargetPos({ x, y });
  app.stage.addChild(otherBunny[clientId].obj);
});

socket.on('userOut', (data) => {
  console.log('[dodo] ', 'userOut', data);
  app.stage.removeChild(otherBunny[data.clientId].obj);
  delete otherBunny[data.clientId];
});

// 断开与服务器的连接
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// 创建一个键盘按键状态对象
const keys = {
  ArrowLeft: false,
  ArrowUp: false,
  ArrowRight: false,
  ArrowDown: false,
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
};

// 监听键盘按键按下和松开事件
window.addEventListener('keydown', (event) => {
  const key = event.code;

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.code;

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = false;
  }
});

// Listen for animate update
app.ticker.add((delta) => {
  let moving = false;
  let flag = false;

  // 根据键盘按键状态来移动精灵
  if (keys.ArrowLeft || keys.KeyA) {
    bunny.move('left', delta);
    moving = true;
  }

  if (keys.ArrowUp || keys.KeyW) {
    bunny.move('up', delta);
    moving = true;
  }

  if (keys.ArrowRight || keys.KeyD) {
    bunny.move('right', delta);
    moving = true;
  }

  if (keys.ArrowDown || keys.KeyS) {
    bunny.move('down', delta);
    moving = true;
  }

  if (moving) {
    flag = !flag;
    if (flag) {
      controlSprite(bunny.position);
    }
  }

  Object.keys(otherBunny).forEach((id) => {
    const _bunny = otherBunny[id];

    if (_bunny.needMove) {
      _bunny.autoMove(delta);
    }
  });
});
