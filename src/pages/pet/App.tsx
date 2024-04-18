import { useEffect } from 'react';
import * as styles from './App.module.less';
import * as PIXI from 'pixi6.js';
import { InternalModel, Live2DModel } from 'pixi-live2d-display';
// @ts-ignore
import { HitAreaFrames } from 'pixi-live2d-display/extra';

// expose PIXI to window so that this plugin is able to
// reference window.PIXI.Ticker to automatically update Live2D models
// @ts-ignore
// PIXI.Renderer.registerPlugin('interaction', PIXI.InteractionManager);
window.PIXI = PIXI;

export const App = () => {
  useEffect(() => {
    const app = new PIXI.Application({
      backgroundColor: 0x777777,
      autoStart: true,
      resizeTo: window,
      view: document.getElementById('dodo-game-root') as HTMLCanvasElement,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: 2, // default: 1 分辨率
    });

    // no `await` here as it's not a Promise
    const model = Live2DModel.fromSync(
      'http://127.0.0.1:5500/wanko/runtime/wanko_touch.model3.json',
      {
        autoInteract: true,
      }
    );

    model.once('load', () => {
      // now it's safe
      app.stage.addChild(model);

      model.scale.set(0.5, 0.5);
      model.anchor.set(0.5, 0.5);
      model.position.set(window.innerWidth / 2, window.innerHeight / 2);

      console.log(
        '[dodo] ',
        'model',
        model.width,
        model.height,
        window.innerWidth,
        window.innerHeight
      );

      model.on('pointerdown', (hitAreaNames) => {
        console.log('[dodo] ', 'hit', hitAreaNames);
        // model.motion('idle');
        model.motion('Shake');
        // model.motion('tap_body');
      });

      model.on('hit', (hitAreaNames) => {
        console.log('[dodo] ', 'hit111  ', hitAreaNames);
        if (hitAreaNames.includes('body')) {
          // body is hit
        }
      });

      model.cursor = 'pointer';

      // 绑定模型拖拽方法
      draggable(model);
      addFrame(model);
      addHitAreaFrames(model);
    });
  }, []);

  function draggable(model: Live2DModel<InternalModel>) {
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

  function addFrame(model: Live2DModel<InternalModel>) {
    const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
    foreground.width = model.internalModel.width;
    foreground.height = model.internalModel.height;
    foreground.alpha = 0.1;

    model.addChild(foreground);
  }

  function addHitAreaFrames(model: Live2DModel<InternalModel>) {
    const hitAreaFrames = new HitAreaFrames();
    hitAreaFrames.visible = true;

    model.addChild(hitAreaFrames);
  }

  return (
    <div className={styles.app}>
      <canvas id='dodo-game-root' className={styles.dodoGameRoot}></canvas>
    </div>
  );
};
