import * as React from 'react';
import * as styles from './App.module.less';
import { toast, Button, Page, Header, loading, Modal, useBoolean, Input, Form, useFormState, Textarea } from 'sweet-me';
import { myPost, useFetch } from '@/utils/fetch';

interface ApiResponse {
  _id?: string;
  title: string;
  content: string;
}


export const App = () => {
  const [modalVisible, showModal, closeModal] = useBoolean();
  const { form } = useFormState<ApiResponse>();

  const { data: listData = [], runApi } = useFetch<ApiResponse[]>({
    url: "/piece/list",
    autoRun: true,
    loadingFn: () => loading('列表加载中...', undefined, false)
  });

  const handleCreate = React.useCallback(() => {
    const pass = form.validate();

    if (!pass) {
      toast('请完整填写内容');
      return;
    }

    const values = form.getFieldsValue();
    console.log('[dodo] ', 'values', values);
    const { title = '', content = '' } = values;
    myPost<ApiResponse>('/piece/create', {}, {
      title: title.trim(),
      content: content.trim()
    }).then((res: any) => {
      if (res?.message) {
        toast(res?.message);
      } else {
        console.log('[dodo] ', 'res', res);
        form.resetField();
        closeModal();
        runApi();
      }
    }).catch(console.error);
  }, [closeModal, form, runApi]);

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title="完整 & 破碎" isSticky />
      {listData?.map(it => (
        <div key={it._id}>
          <div>{it.title}</div>
          <div>{it.content}</div>
        </div>
      ))}
      <Button className={styles.addBtn} status='success' onClick={showModal}>添加碎片</Button>
      <Modal className={styles.modal} visible={modalVisible}>
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item field='title' labelClassName={styles.label}>
              <Input className={styles.input} placeholder='标题' />
            </Form.Item>
            <Form.Item field='content' labelClassName={styles.label}>
              <Textarea className={styles.input} placeholder='内容' />
            </Form.Item>
            <div className={styles.btnWrap}>
              <Button className={styles.addBtn} status='error' onClick={closeModal}>取消</Button>
              <Button className={styles.addBtn} status='success' onClick={handleCreate}>添加</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </Page >);
};
