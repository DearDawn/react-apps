import * as React from 'react';
import * as styles from './App.module.less';
import { toast, notice, Button, Icon, ICON, Page, Header, loading, Modal, useBoolean } from 'sweet-me';
import { useFetch } from '@/utils/fetch';

interface ApiResponse {
  title: string;
  content: string;
}


export const App = () => {
  const [modalVisible, showModal, closeModal] = useBoolean();
  const { data: response, runApi } = useFetch<ApiResponse>({
    url: "/piece",
    init: { method: "POST" },
    loadingFn: () => loading('加载中')
  });

  const { data: listData } = useFetch<ApiResponse[]>({
    url: "/piece/list",
    autoRun: true,
    loadingFn: () => loading('列表加载中...', undefined, false)
  });

  React.useEffect(() => {
    console.log('[dodo] ', 'home');

    setTimeout(() => {
      toast('123123213123213');
      notice.info('耶耶耶')
    }, 3000);
  }, []);

  console.log('[dodo] ', 'listData', listData);

  return (
    <Page maxWidth='100vw' className={styles.app}>
      <Header title="完整 & 破碎" isSticky />
      121212121<Button>你好啊</Button>
      <Button status='success'><Icon type={ICON.sugar} />你好啊</Button>
      <Button size='long' onClick={showModal}>
        <Icon /> 你好啊
      </Button>
      <Modal visible={modalVisible}>
        <Button onClick={closeModal}>
          <Icon /> 你好啊
        </Button>
      </Modal>
    </Page >);
};
