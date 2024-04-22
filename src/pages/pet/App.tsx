import { useEffect } from 'react';
import * as styles from './App.module.less';
import * as PIXI from 'pixi6.js';
import clsx from 'clsx';
import { Page } from 'sweet-me';
import { Pet } from './pet/pet';
import { PET_HEIGHT, PET_WIDTH } from './constant';
import { Game } from './game/game';

// expose PIXI to window so that this plugin is able to
// reference window.PIXI.Ticker to automatically update Live2D models
// @ts-ignore
// PIXI.Renderer.registerPlugin('interaction', PIXI.InteractionManager);
window.PIXI = PIXI;

export const App = () => {
  useEffect(() => {
    new Pet({
      view: document.getElementById('dodo-pet-root') as HTMLCanvasElement,
      width: PET_WIDTH,
      height: PET_HEIGHT,
    });
    new Game({
      view: document.getElementById('dodo-game-root') as HTMLCanvasElement,
    });
  }, []);

  return (
    <Page minWidth='300px' className={clsx(styles.app, {})}>
      <canvas id='dodo-game-root' className={styles.dodoGameRoot}></canvas>
      <canvas
        id='dodo-pet-root'
        width={PET_WIDTH}
        height={PET_HEIGHT}
        style={{ width: PET_WIDTH, height: PET_HEIGHT }}
        className={styles.dodoPetRoot}
      ></canvas>
    </Page>
  );
};
