import { useEffect } from 'react';
import * as styles from './App.module.less';
import * as PIXI from 'pixi6.js';
import { Button } from './components/button';
import { Model } from './components/model';
import clsx from 'clsx';
import { Page } from 'sweet-me';

// expose PIXI to window so that this plugin is able to
// reference window.PIXI.Ticker to automatically update Live2D models
// @ts-ignore
// PIXI.Renderer.registerPlugin('interaction', PIXI.InteractionManager);
window.PIXI = PIXI;

export const App = () => {
  useEffect(() => {
    const app = new PIXI.Application({
      backgroundColor: 0xffffff,
      autoStart: true,
      resizeTo: window,
      view: document.getElementById('dodo-game-root') as HTMLCanvasElement,
      // width: Math.max(Math.min(window.innerWidth, 750), 300),
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio, // default: 1 分辨率
    });

    console.log('[dodo] ', 'app', app.screen.width, app.screen.height);

    // 创建按钮实例
    const button = new Button({ text: '晃身子' });
    app.stage.addChild(button);

    const modelObj = new Model({
      src: 'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/models/wanko/runtime/wanko_touch.model3.json',
    });

    modelObj.model.once('load', () => {
      // now it's safe
      app.stage.addChild(modelObj.model);
      button.onClick(() => {
        modelObj.onPointerDown();
      });
    });
  }, []);

  return (
    <Page minWidth='300px' className={clsx(styles.app, {})}>
      <canvas id='dodo-game-root' className={styles.dodoGameRoot}></canvas>
    </Page>
  );
};
