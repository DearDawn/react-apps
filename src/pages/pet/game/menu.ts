import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { myFetch } from '@/utils/fetch';
import { loading } from 'sweet-me';

export class Menu extends PIXI.Container {
  app: PIXI.Application = null;
  background: PIXI.Graphics;
  button: Button;
  resultMode: boolean;
  buttonText: PIXI.Text;
  scoreId: string;
  rankList: Record<string, any>[];
  constructor({
    app,
    text = '开始游戏',
    resultMode = false,
    scoreId = '',
    rankList = [],
  }) {
    super();

    this.app = app;
    this.resultMode = resultMode;
    this.scoreId = scoreId;
    this.rankList = rankList;
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
    this.button.y = app.screen.height - 500;

    this.background.addChild(this.button);
    this.addChild(this.background);

    if (this.resultMode) {
      this.loadResult();
    }
  }

  onClick(cb) {
    this.button.onClick(() => {
      cb();
    });
  }

  loadResult() {
    this.loadRank();
    this.app.render();
  }

  loadRank() {
    const list = this.rankList;

    // 创建可滚动容器
    const scrollContainer = new PIXI.Container();
    const width = 300;
    const height = 300;
    const background = new PIXI.Graphics();
    background.beginFill(0xffffff, 0.5);
    background.drawRect(0, 0, width, height);
    background.endFill();
    background.position.set(0, 0);
    scrollContainer.addChild(background);
    scrollContainer.pivot.set(width / 2, 0);
    scrollContainer.position.set(
      this.app.screen.width / 2,
      this.app.screen.height - 880
    );

    // 创建一个包含所有滚动内容的容器
    const contentContainer = new PIXI.Container();
    scrollContainer.addChild(contentContainer);

    const title = new PIXI.Text('排行榜', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 'black',
    });
    title.anchor.set(0.5, 0);
    title.position.set(width / 2, 10);
    contentContainer.addChild(title);

    // 遍历滚动内容数据并创建显示元素
    list.forEach((entry, index) => {
      const id = `No.${index + 1}`;
      const name = entry.name.slice(0, 6);
      const score = entry.score;

      const textContainer = new PIXI.Container();
      // 创建文本对象
      const fontStyle = {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 'black',
      };

      const text1 = new PIXI.Text(id, fontStyle);
      const text2 = new PIXI.Text(score, fontStyle);
      const text3 = new PIXI.Text(name, fontStyle);

      text2.anchor.set(0.5, 0);

      // 将文本对象添加到容器中
      textContainer.addChild(text1, text2, text3);

      const totalWidth = text1.width + text2.width + text3.width;
      const space =
        (width - 20 - totalWidth) / (textContainer.children.length - 1);

      let offsetX = 10;

      textContainer.children.forEach((text: PIXI.Text) => {
        text.x = offsetX;
        offsetX += text.width + space;
      });

      text2.position.x = width / 2;

      if (entry._id === this.scoreId) {
        // 创建背景对象
        const background = new PIXI.Graphics();
        background.beginFill(0xffc0cb); // 设置背景色
        background.drawRect(0, 0, width, textContainer.height);
        background.endFill();

        textContainer.addChild(background);
        textContainer.setChildIndex(background, 0);
      }

      textContainer.position.set(0, index * 25 + 45);
      contentContainer.addChild(textContainer);
    });

    // 将滚动容器添加到舞台或其他适当的容器中
    this.background.addChild(scrollContainer);
  }
}
