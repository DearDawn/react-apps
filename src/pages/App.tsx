import * as React from 'react';
import * as styles from './App.module.less';
import { Header, Page, Title } from 'sweet-me';

interface IProps { }

export const App = (props: IProps) => {
  React.useEffect(() => {
    console.log('[dodo] ', 'hello react multi page app!');
  }, []);

  return (
    <Page maxWidth='100vw' className={styles.app}>
      <Header title="小糖的 React 项目合集" isSticky />
      <Title className={styles.title}><a href="./home/">Home 页</a></Title>
      <Title className={styles.title}><a href="./nine/">几点下班</a></Title>
      <Title className={styles.title}><a href="./link/">短链接生成器</a></Title>
      <Title className={styles.title}><a href="./webshot/">网页截图</a></Title>
      <Title className={styles.title}><a href="./piece/">破碎 & 完整</a></Title>
    </Page>
  );
};
