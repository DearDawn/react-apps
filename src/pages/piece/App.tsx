import * as React from 'react';
import * as styles from './App.module.less';
import { toast, notice, Button, Icon, ICON, Page, Header, loading, Modal, useBoolean, Input } from 'sweet-me';
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

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title="完整 & 破碎" isSticky />
      <Button className={styles.addBtn} status='success' onClick={showModal}>添加碎片</Button>
      <Modal className={styles.modal} visible={modalVisible}>
        <div className={styles.content}>
          <Input className={styles.input} placeholder='标题' />
          <Input className={styles.input} placeholder='内容' />
          <div className={styles.btnWrap}>
            <Button className={styles.addBtn} status='error' onClick={closeModal}>取消</Button>
            <Button className={styles.addBtn} status='success' onClick={showModal}>添加</Button>
          </div>
        </div>
      </Modal>
    </Page >);
};
