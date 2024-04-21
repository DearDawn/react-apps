import { InternalModel, Live2DModel } from 'pixi-live2d-display';
import * as PIXI from 'pixi6.js';
import { addFrame, addHitAreaFrames, addDraggable } from '../utils';
import { query, waitTime } from '@/utils';

export class Model {
  model: Live2DModel<InternalModel>

  constructor ({
    src = 'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/models/wanko/runtime/wanko_touch.model3.json',
    draggable = false,
    testMode = query.get('test') === '1'
  }) {
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
    this.model.scale.set(0.3, 0.3);
    this.model.anchor.set(0.5, 0.5);
    this.model.position.set(window.innerWidth / 2, window.innerHeight / 2);
    this.model.cursor = 'pointer';

    this.model.on('pointerdown', this.onPointerDown);
    this.model.on('hit', this.onPointerDown);
  }

  onPointerDown = async (hitAreaNames: any) => {
    console.log('[dodo] ', 'hit', hitAreaNames);
    this.model.motion('Shake');
  }
}