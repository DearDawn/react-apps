import { useState } from 'react';
import * as styles from './App.module.less';
import { Button, Header, Input, Page, Title, loading, toast, useRequest } from 'sweet-me';
import { validUrl } from '@/utils/valid';

interface ApiResponse {
  cover: string;
  title: string;
  favicon: string;
}

export const App = () => {
  const [url, setUrl] = useState("");
  const { data: response, runApi, loading: isLoading, error } = useRequest({
    url: "/api/web-info",
    params: { url, dodokey: 123 },
    loadingFn: () => loading('加载中')
  });

  const handleButtonClick = async () => {
    if (!validUrl(url)) {
      toast("链接格式校验失败，请重新输入");

      return;
    }

    runApi();
  };

  return (
    <Page className={styles.page}>
      <Header title="网页信息抓取" />
      <div className={styles.inputContainer}>
        <Input
          onValueChange={(val = '') => setUrl(val.trim())}
          placeholder="输入网址"
        />
        <Button onClick={handleButtonClick}>开始抓取</Button>
      </div>
      {response && (
        <div className={styles.responseContainer}>
          <Title>网页标题</Title>
          <div className={styles.titleWrap}>
            <img className={styles.icon} src={response.favicon} alt="网页图标" />
            <div className={styles.title}>{response.title}</div>
          </div>
          <Title>网页截图</Title>
          <img className={styles.cover} src={response.cover} alt="网页截图" />
        </div>
      )}
    </Page>
  );
};
