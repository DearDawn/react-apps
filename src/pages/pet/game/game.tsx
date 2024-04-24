import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { Player } from './player';
import { Controller } from './controller';
import { Rules } from './rules';
import { Ground } from './ground';
import { Obstacle } from './block';
import { Score } from './score';
import { Menu } from './menu';
import { Input, showModal, Button as MyButton, Space, loading } from 'sweet-me';
import { myPost } from '@/utils/fetch';

const STORAGE_DURATION_KEY = 'pet_game_duration';

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
  timeStart = Date.now();

  duration = 0;

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

    this.app.ticker.add((delta) => {
      ground.update(delta);

      if (!this.started) return;

      if (this.controller.enabled) {
        // 开始游戏之后才执行
        const spacePressed = this.controller.keys.space.pressed;

        if (spacePressed || this.playerObj.isJumping) {
          this.playerObj.jump(delta);
        }
      }

      this.initBlocks();
      this.blocksLoop(delta);
    });
  }

  get totalDuration() {
    const historyDuration = localStorage.getItem(STORAGE_DURATION_KEY) || 0;
    return Number(historyDuration);
  }

  init() {}

  start() {
    Obstacle.clear();
    this.scoreBoard.clear();
    this.app.stage.removeChild(this.menu);
    this.blockTimeoutTemp = Date.now();
    this.timeStart = Date.now();
    this.started = true;
    this.app.start();
    this.controller.mount();
    this.playerObj.run();
  }

  resetData() {
    this.started = false;
    this.level = 1;
    this.blockTimeout = 1000;
  }

  async gameOver() {
    this.resetData();
    this.app.stop();
    this.playerObj.stop();
    this.controller.destroy();
    this.duration = Math.round((Date.now() - this.timeStart) / 1000);

    const { data } = await this.recordScore();
    const { item, list } = data || {};
    const { _id } = item || {};

    this.menu = new Menu({
      app: this.app,
      text: '重新开始',
      resultMode: true,
      scoreId: _id,
      rankList: list.slice(0, 10),
      duration: this.duration,
      totalDuration: this.totalDuration,
    });
    this.menu.onClick(() => this.start());
    this.app.stage.addChild(this.menu);
    this.app.render();
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
        return;
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
      this.level += 0.06;
    }
  }

  async recordScore() {
    const data = {
      name: '无名大侠',
      score: this.scoreBoard.score,
      duration: this.duration,
    };

    localStorage.setItem(
      STORAGE_DURATION_KEY,
      String(this.totalDuration + this.duration)
    );

    await showModal(({ onClose }) => (
      <div>
        <Space stretch style={{ fontSize: 24, padding: '0 0 15px' }}>
          留名
        </Space>
        <Input
          style={{ borderRadius: '4px 0 0 4px' }}
          placeholder='最大 6 个字'
          maxLength={6}
          defaultValue='无名大侠'
          onValueChange={(val) => {
            data.name = val || '无名大侠';
          }}
        />
        <MyButton style={{ borderRadius: '0 4px 4px 0' }} onClick={onClose}>
          提交
        </MyButton>
      </div>
    ));

    const close = loading('提交中...', undefined, false, 300);

    const res = (await myPost('/pet/rank_add', {}, data)) as {
      data: { item: { _id: string }; list: any[] };
    };

    close();
    return res;
  }
}
