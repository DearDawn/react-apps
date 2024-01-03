import * as React from 'react';
import * as styles from './App.module.less';
import { toast } from 'sweet-me';

interface IProps { }

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'home');

    setTimeout(() => {
      toast('123123213123213');
    }, 3000);
  }, []);

  return <div className={styles.app}>Home</div>;
};
