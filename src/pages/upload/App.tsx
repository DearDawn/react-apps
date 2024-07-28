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
  Form,
  useFormState,
  Space,
  Select,
  InputImage,
} from 'sweet-me';
import { myPostForm, useFetch } from '@/utils/fetch';
import { PieceInfo } from './constant';
import { Card } from './components/card';
import { useCardDetailModal } from '@/utils/hooks';

export const App = () => {
  const [createModalVisible, showCreateModal, closeCreateModal] = useBoolean();
  const [isLoading, startLoading, endLoading] = useBoolean();
  const imageFile = React.useRef<File>(null);

  const { form } = useFormState<PieceInfo>();
  const { data: listData = [], runApi } = useFetch<PieceInfo[]>({
    url: '/bounty/list',
    autoRun: false,
    loadingFn: () => loading('列表加载中...', undefined, false),
  });
  const loadingCb = React.useRef(() => {});

  const { handleClickCard, closeModal, detail, modalVisible } =
    useCardDetailModal<PieceInfo>({ listData });

  const cancelTodo = () => {};

  const handleImageChange = React.useCallback((val) => {
    console.log('[dodo] ', 'val', val);
    imageFile.current = val;
  }, []);

  const handleCreate = () => {
    const pass = form.validate();

    if (!pass) {
      toast('请完整填写内容');
      return;
    }

    const values = form.getFieldsValue();
    const { tag } = values;

    const formData = new FormData();
    formData.append('file', imageFile.current);
    formData.append('tag', tag);
    formData.append('upload_key', 'dododawn');

    startLoading();
    myPostForm<PieceInfo>('/upload/wx', {}, formData)
      .then(() => {
        toast('上传成功');
        form.resetField();
        closeCreateModal();
        runApi();
      })
      .finally(endLoading);
  };

  React.useEffect(() => {
    if (!modalVisible) {
      form.resetField();
    }
  }, [form, modalVisible]);

  React.useEffect(() => {
    if (isLoading) {
      loadingCb.current = loading('请求中...');
    } else {
      loadingCb.current();
    }
  }, [isLoading]);

  React.useEffect(() => {
    if (createModalVisible && detail) {
      form.setFieldsValue(detail);
    }
  }, [createModalVisible, detail, form]);

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title='图片上传（半成品）' isSticky />
      <div className={styles.list}>
        {listData?.map((it) => (
          <Card info={it} key={it.tag} onClick={handleClickCard(it)} />
        ))}
      </div>
      <Button
        className={styles.addBtn}
        status='success'
        onClick={showCreateModal}
      >
        上传图片
      </Button>
      <Modal className={styles.modal} visible={createModalVisible}>
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item field='title' labelClassName={styles.label}>
              <InputImage onValueChange={handleImageChange} />
            </Form.Item>
            <Form.Item field='tag' required defaultValue='snjxh' label='标签'>
              <Select
                options={['snjxh', 'fddm'].map((label) => ({
                  label,
                  value: label,
                }))}
              />
            </Form.Item>
            <div className={styles.holder} />
            <div className={styles.btnWrap}>
              <Button
                className={styles.addBtn}
                status='error'
                onClick={closeCreateModal}
              >
                取消
              </Button>
              <Button
                className={styles.addBtn}
                status='success'
                onClick={handleCreate}
              >
                添加
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal
        className={styles.detailModal}
        visible={modalVisible}
        maskClosable
        onClose={closeModal}
        footer={
          <Space padding='0' className={styles.footer}>
            <Button onClick={cancelTodo} status='success'>
              隐藏
            </Button>
            <Button onClick={cancelTodo} status='error'>
              删除
            </Button>
            <Button onClick={closeModal}>关闭</Button>
          </Space>
        }
      >
        <Card className={styles.cardItem} info={detail} />
      </Modal>
    </Page>
  );
};
