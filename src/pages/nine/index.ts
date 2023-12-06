import * as PIXI from 'pixi.js';
import './styles.less';
import { Bunny } from './Objects/bunny';
import io from 'socket.io-client';
import { isDev } from '@/utils';

const app = new PIXI.Application({ background: '#1099bb', resizeTo: window });

document.body.appendChild(app.view as unknown as Node);

// create a new Sprite from an image path
const bunny = new Bunny(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(bunny.obj);
const otherBunny: Record<string, Bunny> = {};

console.log('[dodo] ', 'isDev', isDev);

// 客户端代码
const socket = io(isDev ? 'http://localhost:3000' : `${location.origin}:9010`); // 连接到服务器的Socket.IO实例

// 发送控制精灵的请求
function controlSprite(data) {
  socket.emit('controlSprite', data);
}

// 监听更新精灵的消息
socket.on('moveSprite', (data) => {
  // 在这里更新精灵的状态
  // console.log('Received updateSprite message:', data);
  otherBunny[data.clientId]?.setPos(data.pos);
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
  console.log('[dodo] ', 'key', key);

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = false;
  }
});

// Listen for animate update
app.ticker.add((delta) => {
  let moving = false;

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
    controlSprite(bunny.position);
  }
});
