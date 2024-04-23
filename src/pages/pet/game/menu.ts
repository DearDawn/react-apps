import * as PIXI from 'pixi6.js';

export class Menu extends PIXI.Container {
  app: PIXI.Application = null;
  background: PIXI.Graphics;
  button: PIXI.Text;
  constructor({ app, text = '开始游戏' }) {
    super();

    this.app = app;
    // 创建蒙层
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.5);
    this.background.drawRect(0, 0, app.screen.width, app.screen.height);
    this.background.endFill();

    // 创建开始游戏按钮
    this.button = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xffffff,
    });

    this.button.anchor.set(0.5);
    this.button.x = app.screen.width / 2;
    this.button.y = app.screen.height / 2;

    // 添加按钮点击事件处理程序
    this.button.interactive = true;
    this.button.buttonMode = true;

    this.background.addChild(this.button);
    this.addChild(this.background);
  }

  onClick(cb) {
    this.button.on('pointerdown', (e) => {
      cb();
    });
  }
}
