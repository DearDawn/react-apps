import * as PIXI from 'pixi6.js';

export class Button extends PIXI.Container {
  constructor ({
    width = 120,
    height = 40,
    radius = 12,
    text = 'Click Me',
    textStyle = { fontFamily: 'Arial', fontSize: 16, fill: 0xffffff },
    fillColor = 0xFFC0CB
  }) {
    super();

    // 创建按钮背景
    const buttonBackground = new PIXI.Graphics();
    buttonBackground.beginFill(fillColor);
    buttonBackground.drawRoundedRect(0, 0, width, height, radius);
    buttonBackground.endFill();
    this.addChild(buttonBackground);

    // 创建按钮文本
    const buttonText = new PIXI.Text(text, textStyle);
    buttonText.anchor.set(0.5);
    buttonText.position.set(width / 2, height / 2);
    this.addChild(buttonText);

    // 设置按钮交互功能
    this.interactive = true;
    this.buttonMode = true;

    this.on('pointerdown', this.onButtonDown);
    this.on('pointerup', this.onButtonUp);
    this.on('pointerupoutside', this.onButtonUp);
  }

  onButtonDown = () => {
    this.scale.set(0.9);
  }

  onClick = (cb = () => { }) => {
    cb?.();
  }

  onButtonUp = () => {
    this.scale.set(1);
    // 在这里执行按钮释放后的逻辑
    this.onClick();
  }

  destroy () {
    // 卸载事件监听器
    this.off('pointerdown', this.onButtonDown);
    this.off('pointerup', this.onButtonUp);
    this.off('pointerupoutside', this.onButtonUp);

    // 调用父类的 destroy 方法
    super.destroy();
  }
}