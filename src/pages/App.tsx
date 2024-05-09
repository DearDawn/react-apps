import * as React from 'react';
import * as styles from './App.module.less';
import { Header, Page, Title } from 'sweet-me';

interface IProps {}

function generateRandomColor() {
  const randomHue = Math.floor(Math.random() * 360); // 随机色调
  const randomColor = `hsl(${randomHue}, 57%, 77%)`;
  return randomColor;
}

export const App = (props: IProps) => {
  const handleClick = (it: { href: string; title: string }) => () => {
    window.location.href = it.href;
  };

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      '%c[dodo] 小糖的 React 项目合集!',
      'color: #fff; background: orange;'
    );
  }, []);

  const PageList = [
    { href: './nine', title: '几点下班' },
    { href: './link', title: '短链生成器' },
    { href: './webshot', title: '网页截图' },
    { href: './piece', title: '破碎 & 完整' },
    { href: './demo', title: '小玩意儿~' },
    { href: './bounty', title: '赏金猎人' },
    { href: './share', title: '共享' },
    { href: './pet', title: '宠物' },
  ];

  return (
    <Page maxWidth='100vw' className={styles.app}>
      <Header title='小糖的 React 项目合集' isSticky />
      <div className={styles.blockWrap}>
        {PageList.map((it) => (
          <div className={styles.block} key={it.href} onClick={handleClick(it)}>
            <div
              className={styles.logo}
              style={{ backgroundColor: generateRandomColor() }}
            >
              {it.title.slice(0, 1)}
            </div>
            <div className={styles.name}>{it.title}</div>
          </div>
        ))}
      </div>
    </Page>
  );
};
