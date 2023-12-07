import * as PIXI from 'pixi.js';
import BubbleImg from '@/assets/bubble.png';
import { waitTime } from '@/utils';

export class Bubble {
  bubbleContainer: PIXI.Container;
  bubbleBg: PIXI.Sprite;
  text: PIXI.Text;
  timer = 0;
  loadingTimer = 0;
  loadingCounter = 0;
  loading = false;
  destroyCb = () => {};

  constructor(x, y) {
    // 创建跟随气泡的容器
    this.bubbleContainer = new PIXI.Container();

    // 创建跟随气泡的背景图像
    this.bubbleBg = new PIXI.Sprite(PIXI.Texture.from(BubbleImg));
    this.bubbleBg.width = 100;
    this.bubbleBg.height = 100;
    this.bubbleBg.anchor.set(0.5, 0.5); // 设置锚点为底部中心
    this.bubbleBg.x = x;
    this.bubbleBg.y = y;
    this.bubbleContainer.addChild(this.bubbleBg);

    // 创建跟随气泡中的文本
    this.text = new PIXI.Text('', {
      fontSize: 10,
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: 80,
    });

    this.text.anchor.set(0.5, 0.5); // 设置锚点为底部中心
    this.text.y = this.bubbleBg.y - 6;
    this.text.x = this.bubbleBg.x;
    this.bubbleContainer.addChild(this.text);
  }

  get obj() {
    return this.bubbleContainer;
  }

  setPos({ x, y }) {
    this.bubbleContainer.x = x;
    this.bubbleContainer.y = y;
  }

  updateBubbleBg() {
    // 更新对话气泡的宽度和高度
    this.bubbleBg.width = Math.min(Math.max(this.text.width + 50, 100), 200);
    this.bubbleBg.height = Math.min(
      Math.max(this.text.height * 2 + 50, 100),
      200
    );
  }

  setText(text = '') {
    clearTimeout(this.timer);
    clearInterval(this.loadingTimer);
    this.text.text = text.slice(0, 24);
    this.updateBubbleBg();
    this.timer = setTimeout(this.destroyCb, 5000);
  }

  async showLoading() {
    if (this.loading) {
      this.loadingCounter = this.loadingCounter % 4;
      return;
    }

    this.loading = true;
    this.loadingTimer = setInterval(() => {
      this.loadingCounter += 1;

      if (this.loadingCounter > 7) {
        clearInterval(this.loadingTimer);
        this.loading = false;
        this.destroyCb();
        return;
      }

      this.text.text = '...'.slice(0, this.loadingCounter % 4);
    }, 300);
  }

  onDestroy(cb = () => {}) {
    this.destroyCb = cb;
  }
}
