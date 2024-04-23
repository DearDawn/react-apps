import * as PIXI from 'pixi6.js';

export class Score extends PIXI.Container {
  app: PIXI.Application = null;
  background: PIXI.Graphics;
  textWrap: PIXI.Text;
  score = 0;
  constructor({ app }) {
    super();

    this.app = app;
    const appWidth = this.app.screen.width;

    const width = 200;
    const height = 50;

    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.8);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    this.addChild(this.background);

    const textStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 'white',
      align: 'center',
    });

    this.textWrap = new PIXI.Text(this.scoreText, textStyle);
    this.textWrap.anchor.set(0.5);
    this.textWrap.position.set(
      this.background.width / 2,
      this.background.height / 2
    );

    this.addChild(this.textWrap);
    this.pivot.set(this.width / 2, this.height / 2);
    this.position.set(appWidth / 2, this.height + 10);
  }

  get scoreText() {
    return `分数：${this.score}`;
  }

  add() {
    this.score += 1;
    this.textWrap.text = this.scoreText;
  }

  clear() {
    this.score = 0;
  }
}
