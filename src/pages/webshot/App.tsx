import { useState } from 'react';
import * as styles from './App.module.less';
import { Button, Header, ICON, Icon, Input, Page, Select, Title, loading, toast } from 'sweet-me';
import { validUrl } from '@/utils/valid';
import { useFetch } from '@/utils/fetch';

interface ApiResponse {
  cover: string;
  cover_pad: string;
  cover_mobile: string;
  title: string;
  date: string;
  url: string;
  favicon: string;
}

type IDevice = 'pc' | 'pad' | 'mobile';

export const App = () => {
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState<IDevice>('pc');
  const { data: response, runApi } = useFetch<ApiResponse>({
    url: "/web-info",
    params: { url, device },
    loadingFn: () => loading('加载中')
  });

  const { data: listData } = useFetch<ApiResponse[]>({
    url: "/web-info/list",
    params: { url },
    autoRun: true,
    loadingFn: () => loading('列表加载中...', undefined, false)
  });

  const getCover = (res: ApiResponse) => {
    return res.cover || res.cover_pad || res.cover_mobile;
  };

  console.log('[dodo] ', 'listData', listData);

  const handleButtonClick = async () => {
    if (!validUrl(url)) {
      toast("链接格式校验失败，请重新输入");

      return;
    }

    runApi();
  };

  return (
    <Page className={styles.page}>
      <Header title="网页信息抓取" isSticky />
      <div className={styles.inputContainer}>
        <Input
          className={styles.input}
          onValueChange={(val = '') => setUrl(val.trim())}
          placeholder="输入网址"
        />
        <Select
          className={styles.select}
          type='icon'
          value={device}
          onValueChange={it => setDevice(it.value as IDevice)}
          options={[
            { label: <Icon type={ICON.pc} />, value: 'pc' },
            { label: <Icon type={ICON.mobile} />, value: 'mobile' },
            { label: <Icon type={ICON.pad} />, value: 'pad' }
          ]}
        />
        <Button onClick={handleButtonClick}>开始抓取</Button>
      </div>
      {response ? (
        <div className={styles.responseContainer}>
          <Title>网页标题</Title>
          <div className={styles.titleWrap}>
            <img className={styles.icon} src={response.favicon} alt="网页图标" />
            <div className={styles.title}>{response.title}</div>
          </div>
          <Title>网页截图</Title>
          <img className={styles.cover} src={getCover(response)} alt="网页截图" />
        </div>
      ) : (
        <div className={styles.emptyHolder}>
          待抓取
        </div>
      )}

      <Title className={styles.listTitle}>已抓取页面</Title>
      <div className={styles.listWrap}>
        {listData?.map(info => (
          <div className={styles.responseContainer} key={info.url}>
            <Title className={styles.itemTitle}>
              <img className={styles.icon} src={info.favicon} alt="网页图标" />
              <div className={styles.title}>{info.title}</div>
            </Title>
            <img className={styles.cover} src={getCover(info)} alt="网页截图" />
          </div>
        ))}
      </div>
    </Page>
  );
};
