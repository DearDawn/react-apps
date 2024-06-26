import { InternalModel, Live2DModel } from 'pixi-live2d-display';
import * as PIXI from 'pixi6.js';
import { addFrame, addHitAreaFrames, addDraggable } from '../utils';
import { isTest } from '@/utils';

export class Model {
  model: Live2DModel<InternalModel>;
  motionIndex = 0;
  app: PIXI.Application = null;

  constructor({
    src = 'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/models/wanko/runtime/wanko_touch.model3.json',
    draggable = false,
    testMode = isTest,
    app,
  }) {
    this.app = app;
    this.model = Live2DModel.fromSync(src, { autoInteract: true });

    this.model.once('load', () => {
      this.initModel();

      if (draggable) {
        addDraggable(this.model);
      }

      if (testMode) {
        addFrame(this.model);
        addHitAreaFrames(this.model);
      }
    });
  }

  initModel = () => {
    this.model.scale.set(0.25);
    this.model.anchor.set(0.5, 0.5);
    this.model.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 - 25
    );
    this.model.cursor = 'pointer';
    this.model.on('pointerdown', this.onPointerDown);
    this.model.on('hit', this.onPointerDown);
  };

  onPointerDown = async (hitAreaNames?: any) => {
    const motionMap: Array<[string, number]> = [
      // ['Idle', 0],
      // ['Idle', 1],
      // ['Idle', 2],
      // ['Flick3', 0],
      ['Flick3', 1],
      ['Shake', 0],
      ['FlickUp', 0],
      ['Tap', 0],
      ['Tap', 1],
      ['Flick', 0],
      // ['Flick', 1],
      ['FlickLeft', 0],
    ];

    const randomIndex =
      Math.floor(Math.random() * 1 * motionMap.length) % motionMap.length;
    const [group, index] = motionMap[randomIndex];
    await this.model.motion(group, index);
    this.motionIndex += 1;
  };
}
