import { InternalModel, Live2DModel } from "pixi-live2d-display";
import * as PIXI from 'pixi6.js';
// @ts-ignore
import { HitAreaFrames } from 'pixi-live2d-display/extra';

export const draggable = (model: Live2DModel<InternalModel>) => {
  model.buttonMode = true;
  model.on('pointerdown', (e) => {
    model['dragging'] = true;
    model['_pointerX'] = e.data.global.x - model.x;
    model['_pointerY'] = e.data.global.y - model.y;
  });
  model.on('pointermove', (e) => {
    if (model['dragging']) {
      model.position.x = e.data.global.x - model['_pointerX'];
      model.position.y = e.data.global.y - model['_pointerY'];
    }
  });
  model.on('pointerupoutside', () => (model['dragging'] = false));
  model.on('pointerup', () => (model['dragging'] = false));
}

export const addFrame = (model: Live2DModel<InternalModel>) => {
  const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
  foreground.width = model.internalModel.width;
  foreground.height = model.internalModel.height;
  foreground.alpha = 0.1;

  model.addChild(foreground);
}

export const addHitAreaFrames = (model: Live2DModel<InternalModel>) => {
  const hitAreaFrames = new HitAreaFrames();
  hitAreaFrames.visible = true;

  model.addChild(hitAreaFrames);
}
