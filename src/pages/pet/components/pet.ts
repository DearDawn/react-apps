import * as PIXI from 'pixi6.js';
import { Model } from './model';
import { Button } from './button';

export class Pet {
  constructor({ view }) {
    const app = new PIXI.Application({
      transparent: true,
      autoStart: true,
      resizeTo: view,
      view,
      width: 150,
      height: 170,
      resolution: window.devicePixelRatio,
    });

    // 创建按钮实例
    const button = new Button({ text: '玩小游戏', app });
    app.stage.addChild(button);

    const modelObj = new Model({
      src: 'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/models/wanko/runtime/wanko_touch.model3.json',
      app,
    });

    modelObj.model.once('load', () => {
      app.stage.addChild(modelObj.model);
      button.onClick(() => {
        // modelObj.onPointerDown();
      });
      app.stage.setChildIndex(button, 1);
    });
  }
}
