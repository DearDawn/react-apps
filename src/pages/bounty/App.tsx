import * as React from 'react';
import * as styles from './App.module.less';
import { toast, Button, Page, Header, loading, Modal, useBoolean, Input, Form, useFormState, Textarea } from 'sweet-me';
import { myPost, useFetch } from '@/utils/fetch';
import { PieceInfo } from './constants';
import { Card } from './components/card';


export const App = () => {
  const [modalVisible, showModal, closeModal] = useBoolean();
  const { form } = useFormState<PieceInfo>();

  const { data: listData = [], runApi } = useFetch<PieceInfo[]>({
    url: "/bounty/list",
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
    myPost<PieceInfo>('/bounty/create', {}, {
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
      <Header title="赏金猎人" isSticky />
      <div className={styles.list}>
        {listData?.map(it => (
          <Card info={it} key={it._id} />
        ))}
      </div>
      <Button className={styles.addBtn} status='success' onClick={showModal}>添加碎片</Button>
      <Modal className={styles.modal} visible={modalVisible}>
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item field='title' labelClassName={styles.label} required>
              <Input className={styles.input} placeholder='标题' />
            </Form.Item>
            <Form.Item field='content' labelClassName={styles.label} required>
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
