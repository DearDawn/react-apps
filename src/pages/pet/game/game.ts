import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { Player } from './player';
import { Controller } from './controller';
import { Rules } from './rules';
import { Ground } from './ground';
import { Obstacle } from './block';
import { Score } from './score';

export class Game {
  app: PIXI.Application;
  playerObj: Player;
  scoreBoard: Score;
  level = 1;
  blockTimeout = 1000;
  blockTimeoutTemp = Date.now();

  constructor({ view }) {
    const app = new PIXI.Application({
      backgroundColor: 0xeeeeee,
      autoStart: true,
      resizeTo: view,
      view,
      resolution: window.devicePixelRatio,
    });
    this.app = app;

    const button = new Button({ text: '游戏开发中', app, width: 120 });
    this.playerObj = new Player({ app });
    const rules = new Rules({
      app,
      text: '跳跃：点击屏幕或敲击空格',
    });
    this.scoreBoard = new Score({ app });
    const ground = new Ground({ app });
    app.stage.addChild(button);
    app.stage.addChild(this.playerObj.player);
    app.stage.addChild(rules);
    app.stage.addChild(this.scoreBoard);
    this.playerObj.run();
    const controller = new Controller({ app: this.app });
    this.init();

    this.app.ticker.add((delta) => {
      this.initBlocks();

      const spacePressed = controller.keys.space.pressed;

      if (spacePressed || this.playerObj.isJumping) {
        this.playerObj.jump(delta);
      }

      ground.update(delta);
      this.blocksLoop(delta);
    });
  }

  init() {}

  initEvent() {}

  initBlocks() {
    if (Date.now() - this.blockTimeoutTemp < this.blockTimeout) return;

    const obstacle = new Obstacle({ app: this.app, level: this.level });
    Obstacle.obstacles.push(obstacle);

    this.blockTimeout = Math.random() * 1000 + 800;
    this.blockTimeoutTemp = Date.now();
  }

  blocksLoop(delta) {
    const obstacles = Obstacle.obstacles;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.update(delta);

      if (this.playerObj.isCollideWith(obstacle.sprite)) {
        console.log('[dodo] ', 'hit', 111);
        this.app.ticker.stop();
      }

      if (obstacle.isOutOfScreen()) {
        obstacle.remove();
        this.scoreBoard.add();
        this.levelUp();
        obstacles.splice(i, 1);
      }
    }
  }

  async initAssets() {}

  levelUp() {
    if (this.level < 4) {
      console.log('[dodo] ', '升级');
      this.level += 0.05;
    }
  }
}
