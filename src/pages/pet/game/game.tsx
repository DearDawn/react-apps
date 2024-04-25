import * as PIXI from 'pixi6.js';
import { Button } from './button';
import { Player } from './player';
import { Controller } from './controller';
import { Rules } from './rules';
import { Ground } from './ground';
import { Obstacle } from './block';
import { Score } from './score';
import { Menu, TMenuConfig } from './menu';
import {
  Input,
  showModal,
  Button as MyButton,
  Space,
  loading,
  toast,
} from 'sweet-me';
import { myFetch, myPost } from '@/utils/fetch';
import { UploadAvatar } from './uploadAvatar';
import { query } from '@/utils';
import { changeShareInfo } from '@/utils/web';

const STORAGE_DURATION_KEY = 'pet_game_duration';

export class Game {
  app: PIXI.Application;
  started = false;
  playerObj: Player;
  scoreBoard: Score;
  controller: Controller;
  menu: Menu;
  shareInfo: {
    title: string;
    url: string;
    description: string;
    name: string;
    score: number;
    avatar: string;
  };
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

    app.stage.addChild(button);
    app.stage.addChild(this.playerObj.player);
    app.stage.addChild(rules);
    app.stage.addChild(this.scoreBoard);
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

      if (this.playerObj.player.playing) {
        this.playerObj.update();
      }

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

  init() {
    if (query.has('id')) {
      const id = query.get('id');

      myFetch(`/pet/config/${id}`)
        .then((res: any) => {
          const avatarSrc = res?.data?.avatar;
          this.playerObj.setAvatar(avatarSrc);
        })
        .catch(() => {
          toast('网络错误');
        });
    }

    this.initMenu();
  }

  initMenu(extra: Omit<TMenuConfig, 'app'> = {}) {
    this.menu = new Menu({ ...extra, app: this.app });
    this.menu.onClick(() => this.start());
    this.menu.onChangeAvatar(this.changeAvatar);
    this.menu.onShare(this.share);
    this.app.stage.addChild(this.menu);
  }

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

    const { data } = (await this.recordScore()) || {};
    const { item, list = [] } = data || {};
    const { _id } = item || {};

    this.initMenu({
      text: '重新开始',
      resultMode: true,
      scoreId: _id,
      rankList: list.slice(0, 10),
      duration: this.duration,
      totalDuration: this.totalDuration,
    });
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
      name: '无名小卒',
      score: this.scoreBoard.score,
      duration: this.duration,
      avatar: this.playerObj.avatarSrc || '',
    };

    const { name = '无名小卒', score = 0 } = data || {};
    const avatar = this.playerObj.avatarSrc || '';

    // 创建分享内容
    this.shareInfo = {
      title: '玩个小游戏~',
      description: `来自收获 ${score} 分的 [${name}]`,
      url: location.href,
      score,
      name,
      avatar: avatar.startsWith('http') ? avatar : undefined,
    };

    console.log('[dodo] ', 'this.shareInfo', this.shareInfo);

    changeShareInfo({
      title: this.shareInfo.title,
      description: this.shareInfo.description,
      image: this.shareInfo.avatar,
    });

    localStorage.setItem(
      STORAGE_DURATION_KEY,
      String(this.totalDuration + this.duration)
    );

    await showModal(
      ({ onClose }) => (
        <div>
          <Space stretch style={{ fontSize: 24, padding: '0 0 15px' }}>
            留名
          </Space>
          <Input
            style={{ borderRadius: '4px 0 0 4px' }}
            placeholder='最大 6 个字'
            maxLength={6}
            defaultValue='无名小卒'
            onValueChange={(val) => {
              data.name = val || '无名小卒';
            }}
          />
          <MyButton style={{ borderRadius: '0 4px 4px 0' }} onClick={onClose}>
            提交
          </MyButton>
        </div>
      ),
      { maskClosable: false }
    );

    const close = loading('提交中...', undefined, false, 300);

    try {
      const res = (await myPost('/pet/rank_add', {}, data)) as {
        data: { item: { _id: string }; list: any[] };
      };

      close();
      return res;
    } catch (error) {
      close();
      toast('网络错误');
      return null;
    }
  }

  changeAvatar = async () => {
    let avatarSrc = '';

    await showModal(({ onClose }) => (
      <UploadAvatar
        onClose={(src) => {
          avatarSrc = src;
          onClose();
        }}
      />
    ));

    if (!avatarSrc) return;

    myPost('/pet/config_add', {}, { avatar: avatarSrc })
      .then((res: any) => {
        // 获取当前页面的 URL
        const currentUrl = window.location.href;

        // 解析 URL，获取参数部分
        const url = new URL(currentUrl);
        const searchParams = url.searchParams;

        // 设置或替换参数值
        searchParams.set('id', res?.id || 0); // 设置或替换 param1 参数的值

        // 生成新的 URL
        const newUrl = url.toString();

        history.replaceState(null, '', newUrl);
      })
      .catch(() => {
        toast('网络错误');
      });

    this.playerObj.setAvatar(avatarSrc);
  };

  share = () => {
    const { title, description, url, name, score } = this.shareInfo || {};
    const shareText = `${title} ${description}\n\n${url}`;

    if (navigator.share) {
      // 调用分享功能
      navigator
        .share()
        .then(function () {
          toast('分享成功');
        })
        .catch(function (error) {
          toast('分享失败' + error.message || '');
        });
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(function () {
          toast('链接已复制到剪贴板');
        })
        .catch(function () {
          toast('不支持分享功能');
        });
    }

    myPost(
      '/pet/share_add',
      {},
      { id: Number(query.get('id')) || 0, name, score, text: shareText }
    ).then((res) => {
      console.log('[dodo] ', 'res', res);
    });
  };
}
