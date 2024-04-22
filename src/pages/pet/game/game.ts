import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { Player } from './player';

export class Game {
  app: PIXI.Application;

  constructor({ view }) {
    const app = new PIXI.Application({
      backgroundColor: 0xeeeeee,
      autoStart: true,
      resizeTo: view,
      view,
      resolution: window.devicePixelRatio,
    });
    this.app = app;

    // 创建按钮实例
    const button = new Button({ text: '游戏开发中', app, width: 120 });
    app.stage.addChild(button);
    const playerObj = new Player({ app });
    app.stage.addChild(playerObj.player);
  }

  init() {}

  async initAssets() {
    // await Assets.load([
    //   {
    //     alias: ['spineSkeleton'],
    //     src: 'https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pro.skel',
    //   },
    //   {
    //     alias: ['spineAtlas'],
    //     src: 'https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pma.atlas',
    //   },
    //   {
    //     alias: ['sky'],
    //     src: 'https://pixijs.com/assets/tutorials/spineboy-adventure/sky.png',
    //   },
    //   {
    //     alias: ['background'],
    //     src: 'https://pixijs.com/assets/tutorials/spineboy-adventure/background.png',
    //   },
    //   {
    //     alias: ['midground'],
    //     src: 'https://pixijs.com/assets/tutorials/spineboy-adventure/midground.png',
    //   },
    //   {
    //     alias: ['platform'],
    //     src: 'https://pixijs.com/assets/tutorials/spineboy-adventure/platform.png',
    //   },
    // ]);
  }
}
