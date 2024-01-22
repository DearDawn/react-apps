import { useState } from 'react';
import * as styles from './App.module.less';
import { myFetch } from '@/utils/fetch';
import { Button, Header, Input, Page, loading, useRequest } from 'sweet-me';

interface ApiResponse {
  cover: string;
  title: string;
  favicon: string;
}

export const App = () => {
  const [url, setUrl] = useState("");
  const { data: response, runApi, loading: isLoading, error } = useRequest({
    url: "/api/web-info",
    params: { url },
    loadingFn: () => loading('加载中')
  });

  console.log('[dodo] ', 'error', error);

  const handleButtonClick = async () => {
    runApi();
  };

  return (
    <Page className={styles.page}>
      <Header title="网页信息抓取" />
      <div className={styles.inputContainer}>
        <Input
          onValueChange={(val) => setUrl(val)}
          placeholder="输入网址"
        />
        <Button onClick={handleButtonClick}>确认</Button>
      </div>
      {response && (
        <div className={styles.responseContainer}>
          <img src={response.cover} alt="网页截图" />
          <div>{response.title}</div>
          <img src={response.favicon} alt="网页图标" />
        </div>
      )}
    </Page>
  );
};
