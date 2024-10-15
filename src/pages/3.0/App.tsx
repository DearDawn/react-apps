import React from 'react';
import ThreeScene from './components/scene';

import * as styles from './App.module.less';

export const App = () => {
  return (
    <div className={styles.app}>
      <ThreeScene />
    </div>
  );
};
