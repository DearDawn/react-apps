import * as PIXI from 'pixi6.js';
import PlayerFrame from './player-frames.png';
import { isTest } from '@/utils';

type PlayState = 'run' | 'jump' | 'static' | 'fall';

const VELOCITY_Y = -18;

export class Player {
  app: PIXI.Application = null;
  player: PIXI.AnimatedSprite;
  body: PIXI.Sprite;
  avatar: PIXI.Sprite;
  state: PlayState;
  preState: PlayState;
  avatarSrc: string;
  initPos: { x: number; y: number };
  /** 重力 */
  gravity = 0.98;
  /** 竖直方向的速度 */
  velocityY = VELOCITY_Y;
  constructor({ app, avatarSrc = '' }) {
    this.app = app;
    this.state = 'static';
    this.initPos = {
      x: this.app.screen.width / 7,
      y: this.app.screen.height - 400,
    };
    this.load();
    this.avatarSrc = avatarSrc;
  }

  load() {
    // 加载雪碧图纹理
    const spriteSheetTexture = PIXI.Texture.from(PlayerFrame);

    // 创建帧动画精灵
    const player = new PIXI.AnimatedSprite(
      Array.from({ length: 8 }).map((_, idx) => {
        const frameTexture = new PIXI.Texture(
          spriteSheetTexture.baseTexture,
          new PIXI.Rectangle(idx * 75, 0, 75, 150)
        );
        return frameTexture;
      })
    );

    this.player = player;

    // 设置动画精灵的位置
    player.position.set(this.initPos.x, this.initPos.y);

    // 设置动画精灵的锚点为中心点
    player.anchor.set(0.5);

    this.initBody();
    this.initAvatar();

    if (isTest) {
      this.initTest();
    }
  }

  get isJumping() {
    return this.state === 'jump';
  }

  get isFalling() {
    return this.state === 'fall';
  }

  jump(delta) {
    if (this.isJumping) {
      // 应用重力效果
      this.velocityY += this.gravity * delta;
      this.player.y += this.velocityY * delta;

      // 玩家触底时停止跳跃
      if (this.player.y >= this.initPos.y) {
        this.player.y = this.initPos.y;
        this.velocityY = VELOCITY_Y;
        this.run();
      }
    } else {
      this.state = 'jump';
      this.player.animationSpeed = 0.1;
    }
  }

  run() {
    this.state = 'run';
    this.player.animationSpeed = 0.2;

    if (!this.player.playing) {
      this.player.play();
    }
  }

  stop() {
    this.player.stop();
  }

  isCollideWith(obj: PIXI.Sprite | PIXI.Graphics) {
    return this.body.getBounds().intersects(obj.getBounds());
  }

  setAvatar(src = '') {
    this.avatarSrc = src;
    this.initAvatar();
  }

  initBody() {
    // 创建边框矩形
    const sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    sprite.width = this.player.width * 0.3;
    sprite.height = this.player.height * 0.75;
    sprite.scale.set(sprite.width, sprite.height);
    sprite.anchor.set(0.5, 0.5);
    this.body = sprite;

    this.player.addChild(this.body);
  }

  initTest() {
    const border = new PIXI.Graphics();
    border.lineStyle(2, 0xff0000);
    border.drawRect(0, 0, this.player.width * 0.3, this.player.height * 0.75);
    border.pivot.set(border.width / 2, border.height / 2);
    border.scale.set(1 / this.body.scale.x, 1 / this.body.scale.y);
    this.body.addChild(border);
  }

  initAvatar() {
    if (!this.avatarSrc) return;

    const currentFrame = this.player.currentFrame;
    this.avatar = new PIXI.Sprite(PIXI.Texture.from(this.avatarSrc));
    this.avatar['posYList'] = [3, 12, 3, 0, 3, 12, 3, 0];
    this.avatar.width = 45;
    this.avatar.height = 45;
    this.avatar.anchor.set(0.5, 0);
    this.avatar.position.set(
      0,
      -this.player.height / 2 + this.avatar['posYList'][currentFrame]
    );
    this.player.addChild(this.avatar);
  }

  update() {
    if (!this.avatarSrc) return;

    const currentFrame = this.player.currentFrame;
    const posYs = this.avatar['posYList'];
    const posY = -this.player.height / 2 + (posYs[currentFrame] || posYs[0]);
    this.avatar.position.set(0, posY);
  }
}
