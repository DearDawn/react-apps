import * as PIXI from 'pixi6.js';

export class Ground {
  app: PIXI.Application;
  scrollSpeed = 4;
  count = 5;
  width = 100;
  height = 5;
  gap = 5;
  blocks: PIXI.Graphics[];
  constructor({ app, color = 0x000000 }) {
    this.app = app;
    this.blocks = [];
    this.count = Math.ceil(this.app.screen.width / this.width) + 1;
    // 创建多个地面精灵，将它们放置在地面序列上
    for (let i = 0; i < this.count; i++) {
      const block = new PIXI.Graphics();
      block.beginFill(color);
      block.drawRect(0, 0, this.width, this.height);
      block.endFill();
      block.y = this.app.screen.height - 330;
      block.x = i * (this.width + this.gap);
      app.stage.addChild(block);
      this.blocks.push(block);
    }
  }

  update() {
    // 更新地面精灵的位置
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      block.x -= this.scrollSpeed;

      // 如果地面精灵完全滚动到屏幕外，则将其重新定位到地面序列的末尾
      if (block.x + this.width <= 0) {
        const previousBlock =
          i === 0 ? this.blocks[this.blocks.length - 1] : this.blocks[i - 1];
        block.x = previousBlock.x + this.width + this.gap;
      }
    }
  }
}
