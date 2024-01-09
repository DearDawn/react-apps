import * as React from 'react';
import * as styles from './App.module.less';
import { toast, notice, Button } from 'sweet-me';

interface IProps { }

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'home');

    setTimeout(() => {
      toast('123123213123213');
      notice.info('耶耶耶')
    }, 3000);
  }, []);

  return <div className={styles.app}>
    <Button>你好啊</Button>
    <Button status='success'>你好啊</Button>
    <Button size='long'>你好啊</Button>
  </div>;
};
