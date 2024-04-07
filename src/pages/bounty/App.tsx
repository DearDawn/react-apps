import * as React from 'react';
import * as styles from './App.module.less';
import {
  toast,
  Button,
  Page,
  Header,
  loading,
  Modal,
  useBoolean,
  Input,
  Form,
  Textarea,
  Select,
  useFormState
} from 'sweet-me';
import { myPost, useFetch } from '@/utils/fetch';
import { PieceInfo } from './constants';
import { Card } from './components/card';
import { useCardDetailModal } from '@/utils/hooks';


export const App = () => {
  const [createModalVisible, showCreateModal, closeCreateModal] = useBoolean();
  const { handleClickCard, closeModal, detail, modalVisible } = useCardDetailModal<PieceInfo>();
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
    const { title = '', content = '', priority, level } = values;
    myPost<PieceInfo>('/bounty/create', {}, {
      title: title.trim(),
      content: content.trim(),
      priority,
      level
    }).then((res: any) => {
      if (res?.message) {
        toast(res?.message);
      } else {
        console.log('[dodo] ', 'res', res);
        form.resetField();
        closeCreateModal();
        runApi();
      }
    }).catch(console.error);
  }, [closeCreateModal, form, runApi]);

  React.useEffect(() => {
    if (!modalVisible) {
      form.resetField();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible]);

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title="赏金猎人" isSticky />
      <div className={styles.list}>
        {listData?.map(it => (
          <Card info={it} key={it._id} onClick={handleClickCard(it)} />
        ))}
      </div>
      <Button className={styles.addBtn} status='success' onClick={showCreateModal}>添加赏金任务</Button>
      <Modal className={styles.modal} visible={createModalVisible}>
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item field='title' labelClassName={styles.label} required>
              <Input className={styles.input} placeholder='摘要' />
            </Form.Item>
            <Form.Item field='content' labelClassName={styles.label} required>
              <Textarea className={styles.input} placeholder='备注' />
            </Form.Item>
            <Form.Item field='priority' labelClassName={styles.label} required defaultValue={20}>
              <Select
                className={styles.select}
                placeholder='优先级'
                align='left'
                options={[
                  { label: '紧急', value: 0 },
                  { label: '还行', value: 5 },
                  { label: '佛系', value: 10 },
                  { label: '都行', value: 15 },
                  { label: '待定', value: 20 },
                ]}
              />
            </Form.Item>
            <Form.Item
              field='level'
              className={styles.formItemZ1}
              labelClassName={styles.label}
              required
              defaultValue={20}
            >
              <Select
                className={styles.select}
                placeholder='难度'
                align='left'
                defaultValue={20}
                options={[
                  { label: '挺难', value: 0 },
                  { label: '麻烦', value: 5 },
                  { label: '轻松', value: 10 },
                  { label: '不屑', value: 15 },
                  { label: '未知', value: 20 },
                ]}
              />
            </Form.Item>
            <div className={styles.holder} />
            <div className={styles.btnWrap}>
              <Button className={styles.addBtn} status='error' onClick={closeCreateModal}>取消</Button>
              <Button className={styles.addBtn} status='success' onClick={handleCreate}>添加</Button>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal
        className={styles.detailModal}
        visible={modalVisible}
        maskClosable
        onClose={closeModal}
        footer={<Button onClick={closeModal}>关闭</Button>}
      >
        <Card className={styles.cardItem} info={detail} />
      </Modal>
    </Page>
  );
};
