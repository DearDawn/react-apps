import * as PIXI from 'pixi6.js';
import PlayerFrame from './player-frames.png';

type PlayState = 'run' | 'jump' | 'static' | 'fall';

const VELOCITY_Y = -11;

export class Player {
  app: PIXI.Application = null;
  player: PIXI.AnimatedSprite;
  state: PlayState;
  preState: PlayState;
  initPos: { x: number; y: number };
  /** 重力 */
  gravity = 0.3;
  /** 竖直方向的速度 */
  velocityY = VELOCITY_Y;
  constructor({ app }) {
    this.app = app;
    this.state = 'static';
    console.log('[dodo] ', ' this.app', this.app);
    this.initPos = {
      x: this.app.screen.width / 7,
      y: this.app.screen.height - 400,
    };
    this.load();
  }

  async load() {
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
  }

  get isJumping() {
    return this.state === 'jump';
  }

  get isFalling() {
    return this.state === 'fall';
  }

  jump() {
    if (this.isJumping) {
      // 应用重力效果
      this.velocityY += this.gravity;
      this.player.y += this.velocityY;

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
}
