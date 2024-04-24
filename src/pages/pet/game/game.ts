import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { Player } from './player';
import { Controller } from './controller';
import { Rules } from './rules';
import { Ground } from './ground';
import { Obstacle } from './block';
import { Score } from './score';
import { Menu } from './menu';

export class Game {
  app: PIXI.Application;
  started = false;
  playerObj: Player;
  scoreBoard: Score;
  controller: Controller;
  menu: Menu;
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
    this.menu = new Menu({ app });
    this.menu.onClick(() => this.start());

    app.stage.addChild(button);
    app.stage.addChild(this.playerObj.player);
    app.stage.addChild(rules);
    app.stage.addChild(this.scoreBoard);
    app.stage.addChild(this.menu);
    this.controller = new Controller({
      app: this.app,
      onSpace: () => {
        if (!this.app.ticker.started || !this.started) {
          this.start();
        }
      },
    });
    this.playerObj.run();

    this.init();

    this.app.ticker.add((delta) => {
      ground.update(delta);

      if (!this.started) return;

      // 开始游戏之后才执行
      const spacePressed = this.controller.keys.space.pressed;

      if (spacePressed || this.playerObj.isJumping) {
        this.playerObj.jump(delta);
      }

      this.initBlocks();
      this.blocksLoop(delta);
    });
  }

  init() {
    this.app.render();
  }

  start() {
    Obstacle.clear();
    this.scoreBoard.clear();
    this.app.stage.removeChild(this.menu);
    this.blockTimeoutTemp = Date.now();
    this.started = true;
    this.app.start();
  }

  resetData() {
    this.started = false;
    this.level = 1;
    this.blockTimeout = 1000;
  }

  gameOver() {
    this.menu = new Menu({ app: this.app, text: '重新开始' });
    this.menu.onClick(() => this.start());
    this.app.stage.addChild(this.menu);
    this.app.stop();
    this.resetData();
  }

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
        this.gameOver();
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
    if (this.level < 6) {
      console.log('[dodo] ', '升级');
      this.level += 0.06;
    }
  }
}
