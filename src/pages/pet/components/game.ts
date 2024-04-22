import * as PIXI from 'pixi6.js';
import { Button } from './button';

export class Game {
  constructor({ view }) {
    const app = new PIXI.Application({
      backgroundColor: 0xeeeeee,
      autoStart: true,
      resizeTo: view,
      view,
      resolution: window.devicePixelRatio,
    });

    // 创建按钮实例
    const button = new Button({ text: '游戏开发中', app, width: 120 });
    app.stage.addChild(button);

    // 监听窗口尺寸变化事件
    window.addEventListener('resize', resizeHandler);

    // 处理窗口尺寸变化的函数
    function resizeHandler() {
      // 更新渲染器的大小为 300 x 300，保持限制尺寸
      // app.renderer.resize(app.renderer.width, app.renderer.height);
    }
  }
}
