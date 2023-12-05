import * as React from 'react';
import * as styles from './App.module.less';

interface IProps {}

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'home');
  }, []);

  return <div className={styles.app}>TEST</div>;
};
