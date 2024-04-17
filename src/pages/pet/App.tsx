import { useEffect } from 'react';
import * as styles from './App.module.less';
import * as PIXI from 'pixi6.js';
import { Live2DModel } from 'pixi-live2d-display';

// expose PIXI to window so that this plugin is able to
// reference window.PIXI.Ticker to automatically update Live2D models
// @ts-ignore
// PIXI.Renderer.registerPlugin('interaction', PIXI.InteractionManager);
window.PIXI = PIXI;

export const App = () => {
  useEffect(() => {
    const app = new PIXI.Application({
      autoStart: true,
      resizeTo: window,
      view: document.getElementById('dodo-game-root') as HTMLCanvasElement,
    });

    // no `await` here as it's not a Promise
    const model = Live2DModel.fromSync(
      'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/models/wanko/wanko.model.json',
      { autoInteract: true }
    );

    model.once('load', () => {
      // now it's safe
      app.stage.addChild(model);

      model.anchor.set(0.5, 0.5);
      model.scale.set(0.3, 0.3);
      model.position.set(window.innerWidth / 2, window.innerHeight / 2);

      model.on('pointerdown', () => {
        console.log('[dodo] ', 'hit');
        // model.motion('idle');
        model.motion('shake');
        // model.motion('tap_body');
      });

      function draggable(model) {
        model.buttonMode = true;
        model.on('pointerdown', (e) => {
          model.dragging = true;
          model._pointerX = e.data.global.x - model.x;
          model._pointerY = e.data.global.y - model.y;
        });
        model.on('pointermove', (e) => {
          if (model.dragging) {
            model.position.x = e.data.global.x - model._pointerX;
            model.position.y = e.data.global.y - model._pointerY;
          }
        });
        model.on('pointerupoutside', () => (model.dragging = false));
        model.on('pointerup', () => (model.dragging = false));
      }

      // 绑定模型拖拽方法
      draggable(model);
    });
  }, []);

  return (
    <div className={styles.app}>
      <canvas id='dodo-game-root' className={styles.dodoGameRoot}></canvas>
    </div>
  );
};
