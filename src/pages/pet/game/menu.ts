import * as PIXI from 'pixi6.js';
import { Button } from './button';
import DefaultAvatar from './player-head.png';

export class Menu extends PIXI.Container {
  app: PIXI.Application = null;
  background: PIXI.Graphics;
  button: Button;
  avatarButton: Button;
  resultMode: boolean;
  buttonText: PIXI.Text;
  scoreId: string;
  duration: number;
  totalDuration: number;
  rankList: Record<string, any>[];
  constructor({
    app,
    text = '开始游戏',
    resultMode = false,
    scoreId = '',
    duration = 0,
    totalDuration = 0,
    rankList = [],
  }) {
    super();

    this.app = app;
    this.resultMode = resultMode;
    this.scoreId = scoreId;
    this.rankList = rankList;
    this.duration = duration;
    this.totalDuration = totalDuration;
    // 创建蒙层
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.6);
    this.background.drawRect(0, 0, app.screen.width, app.screen.height);
    this.background.endFill();

    // 创建按钮背景
    this.button = new Button({
      width: 250,
      height: 70,
      app: this.app,
      text,
      textStyle: { fontFamily: 'Arial', fontSize: 36, fill: 0x000000 },
      fillColor: 0xffffff,
    });

    this.button.x = app.screen.width / 2;

    this.avatarButton = new Button({
      width: 100,
      height: 40,
      app: this.app,
      text: '更换头像',
      bgAlpha: 0.1,
      fillColor: 0xffffff,
      textStyle: { fontFamily: 'Arial', fontSize: 20, fill: 0xeeeeee },
    });

    this.avatarButton.x = this.app.screen.width / 2;

    if (this.resultMode) {
      this.button.y = this.app.screen.height / 2 + 150;
    } else {
      this.button.y = this.app.screen.height / 2 - 50;
    }

    this.avatarButton.y = this.button.y + 70;

    this.background.addChild(this.button);
    this.background.addChild(this.avatarButton);
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

  onChangeAvatar(cb) {
    this.avatarButton.onClick(() => {
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
    background.beginFill(0xffffff, 0.6);
    background.drawRoundedRect(0, 0, width, height, 12);
    background.endFill();
    background.position.set(0, 0);
    scrollContainer.addChild(background);
    scrollContainer.pivot.set(width / 2, 0);
    scrollContainer.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 - 250
    );

    const congrats = new PIXI.Text(
      `本局你摸了 ${this.duration} 秒，累计 ${this.totalDuration} 秒`,
      {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 'white',
      }
    );
    congrats.anchor.set(0.5, 0);
    congrats.position.set(width / 2, -50);
    scrollContainer.addChild(congrats);

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

    const avatarLoader = new PIXI.Loader();

    // 监听加载完成事件
    avatarLoader.onComplete.once(() => {
      this.app.render();
    });

    // 遍历滚动内容数据并创建显示元素
    list.forEach((entry, index) => {
      const id = `No.${index + 1}`;
      const name = entry.name.slice(0, 6);
      const score = entry.score;
      const avatar = entry.avatar || DefaultAvatar;

      if (!PIXI.utils.TextureCache[avatar]) {
        avatarLoader.add(avatar, avatar);
      }

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
      const text4 = new PIXI.Sprite(PIXI.Texture.from(avatar));
      text4.width = 20;
      text4.height = 20;
      text4.anchor.set(0, 0.5);
      // 创建一个具有圆角的遮罩
      const mask = new PIXI.Graphics();
      mask.beginFill(0xffffff);
      mask.drawRoundedRect(0, 0, 20, 20, 10);
      mask.endFill();
      mask.pivot.set(0, mask.height / 2);
      text4.mask = mask;

      text2.anchor.set(0.5, 0);

      // 将文本对象添加到容器中
      textContainer.addChild(text1, text2, text3);

      const totalWidth = text1.width + text2.width + text3.width;
      const space =
        (width - 50 - totalWidth) / (textContainer.children.length - 1);

      let offsetX = 10;

      textContainer.children.forEach((text: PIXI.Text) => {
        text.x = offsetX;
        offsetX += text.width + space;
      });

      text2.x = width / 2 - 30;
      text4.position.set(width - text4.width - 10, textContainer.height / 2);
      // 设置遮罩和精灵的位置
      mask.position.set(text4.x, text4.y);
      textContainer.addChild(mask);
      textContainer.addChild(text4);

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

    // 开始加载
    avatarLoader.load();
    // 将滚动容器添加到舞台或其他适当的容器中
    this.background.addChild(scrollContainer);
  }
}
