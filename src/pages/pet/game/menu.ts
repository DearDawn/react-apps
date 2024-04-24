import * as PIXI from 'pixi6.js';
import { Button } from './button';

export class Menu extends PIXI.Container {
  app: PIXI.Application = null;
  background: PIXI.Graphics;
  button: Button;
  buttonText: PIXI.Text;
  constructor({ app, text = '开始游戏' }) {
    super();

    this.app = app;
    // 创建蒙层
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.5);
    this.background.drawRect(0, 0, app.screen.width, app.screen.height);
    this.background.endFill();

    // 创建按钮背景
    this.button = new Button({
      width: 300,
      height: 100,
      app: this.app,
      text,
      textStyle: { fontFamily: 'Arial', fontSize: 36, fill: 0x000000 },
      fillColor: 0xffffff,
    });

    this.button.x = app.screen.width / 2;
    this.button.y = app.screen.height / 2;

    this.background.addChild(this.button);
    this.addChild(this.background);
  }

  onClick(cb) {
    this.button.onClick(() => {
      cb();
    });
  }
}
