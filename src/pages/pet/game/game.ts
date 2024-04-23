import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { Player } from './player';
import { Controller } from './controller';
import { Rules } from './rules';
import { Ground } from './ground';

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
    const playerObj = new Player({ app });
    const rules = new Rules({
      app,
      text: '跳跃：点击屏幕或敲击空格',
    });
    const ground = new Ground({ app });
    app.stage.addChild(button);
    app.stage.addChild(playerObj.player);
    app.stage.addChild(rules);
    playerObj.run();
    const controller = new Controller({ app });

    this.app.ticker.add((time) => {
      const spacePressed = controller.keys.space.pressed;

      if (spacePressed || playerObj.isJumping) {
        playerObj.jump();
      }

      ground.update();
    });
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
