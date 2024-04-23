import * as PIXI from 'pixi6.js';

export class Rules extends PIXI.Container {
  app: PIXI.Application = null;
  background: PIXI.Graphics;
  constructor({ text, app }) {
    super();

    this.app = app;
    const rendererWidth = this.app.renderer.width / devicePixelRatio;
    const rendererHeight = this.app.renderer.height / devicePixelRatio;

    const width = rendererWidth - 150;
    const height = 160;

    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.8);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    this.addChild(this.background);

    const textStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 'white',
      wordWrap: true,
      breakWords: true,
      lineHeight: 24,
      wordWrapWidth: width - 20,
    });

    const rulesText = new PIXI.Text(text, textStyle);
    rulesText.x = 10;
    rulesText.y = 10;
    this.addChild(rulesText);

    this.position.set(10, rendererHeight - height - 10);
  }
}
