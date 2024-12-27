import * as React from 'react';
import * as styles from './App.module.less';
import { Header, ICON, Icon, Page } from 'sweet-me';
import { ScaleWrap } from './demo/components/scale';

interface IProps {}

function generateRandomColor() {
  const randomHue = Math.floor(Math.random() * 360); // 随机色调
  const randomColor = `hsl(${randomHue}, 57%, 77%)`;
  return randomColor;
}

const PageItem = ({ onClick, item, parent }) => {
  const fromRef = React.useRef<HTMLDivElement>();

  const handleOpen = () => {
    window.open(item.href, '_blank');
  };

  return (
    <>
      <div className={styles.block} onClick={onClick} ref={fromRef}>
        <div
          className={styles.logo}
          style={{ backgroundColor: generateRandomColor() }}
        >
          {item.title.slice(0, 1)}
        </div>
        <div className={styles.name}>{item.title}</div>
      </div>
      <ScaleWrap fromRef={fromRef} root={parent}>
        {({ onClose }) => (
          <div className={styles.iframeWrap}>
            <iframe className={styles.iframe} src={item.href} />
            <div className={styles.closeWrap} onClick={onClose}>
              <Icon type={ICON.close} />
            </div>
            <div
              className={styles.openWrap}
              onClick={() => {
                handleOpen();
                onClose();
              }}
            >
              <Icon type={ICON.magicBar} />
            </div>
          </div>
        )}
      </ScaleWrap>
    </>
  );
};

const PageList = [
  { href: './nine/', title: '几点下班' },
  { href: './link/', title: '短链生成器' },
  { href: './webshot/', title: '网页截图' },
  { href: './piece/', title: '破碎 & 完整' },
  { href: './demo/', title: '小玩意儿~' },
  { href: './bounty/', title: '赏金猎人' },
  { href: './share/', title: '共享' },
  { href: './pet/', title: '宠物' },
  { href: './upload/', title: '上传图片' },
  { href: '../sweet-me/', title: '小糖的组件库' },
  { href: '../hope-wall/', title: '未来 TODO' },
  { href: '../test/progress', title: '打工进度条' },
  { href: './tower/', title: '塔防(无成品)' },
  { href: './3.0/', title: '小破站 3.0 (无成品)' },
];

export const App = (props: IProps) => {
  const appRef = React.useRef<HTMLDivElement>();
  const handleClick = (it: { href: string; title: string }) => () => {};

  const handleRefresh = () => {
    window.location.reload();
  };

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      '%c[dodo] 小糖的 React 项目合集!',
      'color: #fff; background: orange;'
    );

    const fragment = document.createDocumentFragment();

    PageList.forEach((page) => {
      // 创建一个 <link> 元素
      const linkElement = document.createElement('link');

      // 设置 <link> 元素的属性和值
      linkElement.rel = 'preload';
      linkElement.href = page.href;
      linkElement.as = 'document';
      fragment.appendChild(linkElement);
    });

    // 将 <link> 元素插入到头部（head）中.
    document.head.appendChild(fragment);
  }, []);

  return (
    <Page minWidth='300px' className={styles.app} pageRef={appRef}>
      <Header
        title='小糖的 React 项目合集'
        isSticky
        rightPart={<Icon type={ICON.sugar} onClick={handleRefresh} />}
      />
      <div className={styles.blockWrap}>
        {PageList.map((it) => (
          <PageItem
            onClick={handleClick(it)}
            key={it.href}
            item={it}
            parent={appRef}
          />
        ))}
      </div>
    </Page>
  );
};
