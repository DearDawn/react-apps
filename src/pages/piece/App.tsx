import * as React from 'react';
import * as styles from './App.module.less';
import { toast, notice, Button, Icon, ICON, Page, Header } from 'sweet-me';

interface IProps { }

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'home');

    setTimeout(() => {
      toast('123123213123213');
      notice.info('耶耶耶')
    }, 3000);
  }, []);

  return (
    <Page maxWidth='100vw' className={styles.app}>
      <Header title="完整 & 破碎" isSticky />
      121212121<Button>你好啊</Button>
      <Button status='success'><Icon type={ICON.sugar} />你好啊</Button>
      <Button size='long'>
        <Icon /> 你好啊
      </Button>
    </Page>);
};
