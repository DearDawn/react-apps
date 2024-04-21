import { useEffect } from 'react';
import * as styles from './App.module.less';
import * as PIXI from 'pixi6.js';
import { Button } from './components/button';
import { Model } from './components/model';

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
    const button = new Button({});
    const modelObj = new Model({
      src: 'http://127.0.0.1:5500/wanko/runtime/wanko_touch.model3.json',
    });

    modelObj.model.once('load', () => {
      // now it's safe
      app.stage.addChild(modelObj.model);
      // 创建按钮实例
      app.stage.addChild(button);
    });
  }, []);

  return (
    <div className={styles.app}>
      <canvas id='dodo-game-root' className={styles.dodoGameRoot}></canvas>
    </div>
  );
};
