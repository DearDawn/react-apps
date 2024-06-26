import * as PIXI from 'pixi.js';
import { Bunny } from './Objects/bunny';
import { socket } from './socket';

let lockKey = false;

const app = new PIXI.Application({
  background: '#1099bb',
  // background: '#999',
  resizeTo: window,
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: 2, // default: 1 分辨率
  // antialias: true
});

app.renderer.resize(window.innerWidth / 2, window.innerHeight / 2);

// create a new Sprite from an image path
const bunny = new Bunny(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(bunny.obj);
const otherBunny: Record<string, Bunny> = {};

// 发送控制精灵的请求
function controlSprite (data) {
  socket.emit('controlSprite', data);
}

function talk (text = '') {
  socket.emit('talking', text);
}

function type (typing = false) {
  socket.emit('typing', typing);
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
  const { clientId, pos, visible } = data;
  const { x = app.screen.width / 2, y = app.screen.height / 2 } = pos || {};
  otherBunny[clientId] = new Bunny(x, y);
  otherBunny[clientId].setTargetPos({ x, y });
  otherBunny[clientId].visible(visible);
  app.stage.addChild(otherBunny[clientId].obj);
});

socket.on('talking', (data = {}) => {
  const { clientId, text } = data;
  otherBunny[clientId].say(text);
});

socket.on('typing', (data = {}) => {
  const { clientId } = data;
  otherBunny[clientId].typing();
});

socket.on('userVisible', (data = {}) => {
  console.log('[dodo] ', 'userVisible', data);
  const { clientId, visible } = data;
  otherBunny[clientId].visible(visible);
});

socket.on('userOut', (data) => {
  console.log('[dodo] ', 'userOut', data);
  if (otherBunny[data.clientId]) {
    app.stage.removeChild(otherBunny[data.clientId].obj);
    delete otherBunny[data.clientId];
  }
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
  KeyO: false,
};

// 监听键盘按键按下和松开事件
window.addEventListener('keydown', (event) => {
  const key = event.code;

  if (lockKey) return;

  if (key === 'KeyT') {
    document.getElementById('talk')?.click();
  }

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.code;

  if (lockKey) return;

  // 更新键盘按键状态
  if (key in keys) {
    keys[key] = false;
  }
});

window.onload = () => {
  const gameRoot = document.getElementById('dodo-game-root');
  gameRoot.appendChild(app.view as unknown as Node);

  window.focus();
  document.getElementById('talk-input').onfocus = () => {
    lockKey = true;
  };
  document.getElementById('talk-input').onblur = () => {
    lockKey = false;
  };
};

document.addEventListener('visibilitychange', () => {
  const isVisible = document.visibilityState === 'visible';

  socket.emit('userVisible', isVisible);
  bunny.visible(isVisible);

  if (!isVisible) {
    Object.keys(keys).filter(key => !!keys[key]).forEach(key => {
      keys[key] = false;
    });
  }
});

// Listen for animate update
app.ticker.add((delta) => {
  let moving = false;
  const flag = 0;

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

  if (keys.KeyO) {
    bunny.say('你好啊！');
  }

  if (moving) {
    controlSprite(bunny.position);
  }

  Object.keys(otherBunny).forEach((id) => {
    const _bunny = otherBunny[id];

    if (_bunny.needMove) {
      _bunny.autoMove(delta);
    }
  });
});

export const handleTalk = (text = '') => {
  bunny.say(text);
  talk(text);
};

export const handleType = () => {
  bunny.typing();
  type();
};
