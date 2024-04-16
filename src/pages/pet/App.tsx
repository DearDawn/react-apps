import { useEffect } from 'react';
import * as styles from './App.module.less';
import * as PIXI from 'pixi6.js';
import { Live2DModel } from 'pixi-live2d-display';

export const App = () => {
  useEffect(() => {
    // expose PIXI to window so that this plugin is able to
    // reference window.PIXI.Ticker to automatically update Live2D models
    // @ts-ignore
    window.PIXI = PIXI;

    const app = new PIXI.Application({
      view: document.getElementById('dodo-game-root') as HTMLCanvasElement,
    });

    // no `await` here as it's not a Promise
    const model = Live2DModel.fromSync(
      'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/models/wanko/wanko.model.json'
    );

    model.once('load', () => {
      // now it's safe
      app.stage.addChild(model);
      model.scale.set(0.25);
      model.x = 10;
    });
  }, []);

  return (
    <div className={styles.app}>
      <canvas id='dodo-game-root' className={styles.dodoGameRoot}></canvas>
    </div>
  );
};
