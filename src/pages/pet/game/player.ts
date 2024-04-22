import * as PIXI from 'pixi6.js';
import PlayerFrame from './player-frames.png';

// Class for handling the character Spine and its animations.
export class Player {
  app: PIXI.Application = null;
  player: PIXI.Sprite;
  constructor({ app }) {
    this.app = app;
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
    player.position.set(
      this.app.renderer.width / 2 / devicePixelRatio,
      this.app.renderer.height / 2 / devicePixelRatio
    );

    // 设置动画精灵的锚点为中心点
    player.anchor.set(0.5);
    // 播放动画
    player.animationSpeed = 0.2;
    player.play();
  }

  setup(cb) {}
}
