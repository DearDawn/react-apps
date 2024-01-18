import { useState } from 'react';
import * as styles from './App.module.less';
import { apiGet } from '@/utils/fetch';
import { Button, Header, Page } from 'sweet-me';

interface ApiResponse {
  cover: string;
  title: string;
  favicon: string;
}

export const App = () => {
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleButtonClick = async () => {
    try {
      const apiResponse = await apiGet<any>("/web-info", { url });
      console.log('[dodo] ', 'apiResponse', apiResponse);
      setResponse(apiResponse);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Page className={styles.page}>
      <Header title="网页信息抓取" />
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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
