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
  Input,
  Icon,
  ICON,
} from 'sweet-me';
import { myPost, myPostForm, useFetch } from '@/utils/fetch';
import { ImageCreateInfo, ImageInfo } from './constant';
import { Card } from './components/card';
import { useCardDetailModal } from '@/utils/hooks';
import { showLoginBox } from '@/utils/login';
import { getFileExt } from '@/utils/file';

export const App = () => {
  const [createModalVisible, showCreateModal, closeCreateModal] = useBoolean();
  const [isLoading, startLoading, endLoading] = useBoolean();
  const imageFile = React.useRef<File>(null);

  const { form } = useFormState<ImageCreateInfo>();
  const { data, runApi } = useFetch<{ data: ImageInfo[] }>({
    url: '/upload/wx_list',
    autoRun: true,
    params: { all: true },
    loadingFn: () => loading('列表加载中...', undefined, false),
  });
  const loadingCb = React.useRef(() => {});
  const listData = data?.data || [];

  const { handleClickCard, closeModal, detail, modalVisible } =
    useCardDetailModal<ImageInfo>({ listData });

  const handleImageChange = React.useCallback((val) => {
    imageFile.current = val;
  }, []);

  const handleDelCard = () => {
    startLoading();
    myPost<any>('/upload/wx_del', {}, { id: detail.src })
      .then(() => {
        closeModal();
        toast('删除成功');
        runApi();
      })
      .finally(endLoading);
  };

  const handleCreate = () => {
    const pass = form.validate();

    if (!pass) {
      toast('请完整填写内容');
      return;
    }

    const values = form.getFieldsValue();
    const { tag, source } = values;

    const formData = new FormData();
    formData.append('file', imageFile.current);
    formData.append('ext', getFileExt(imageFile.current));
    formData.append('tag', tag);
    formData.append('source', source);
    formData.append('upload_key', 'dododawn');

    startLoading();
    myPostForm<ImageInfo>('/upload/wx', {}, formData)
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
      <Header
        title='图片上传（半成品）'
        isSticky
        rightPart={<Icon type={ICON.sugar} onClick={() => showLoginBox()} />}
      />
      <div className={styles.list}>
        {listData?.map((it) => (
          <Card info={it} key={it.src} onClick={handleClickCard(it)} />
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
            <Form.Item field='src' label='图片'>
              <InputImage
                onValueChange={handleImageChange}
                maxSize={2 * 1024 * 1024}
              />
            </Form.Item>
            <Form.Item field='tag' required defaultValue='snjxh' label='标签'>
              <Select
                options={['snjxh', 'fddm', 'test'].map((label) => ({
                  label,
                  value: label,
                }))}
              />
            </Form.Item>
            <Form.Item field='source' required defaultValue='' label='来源'>
              <Input placeholder='请输入' />
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
            {/* <Button onClick={cancelTodo} status='success'>
              隐藏
            </Button> */}
            <Button onClick={handleDelCard} status='error'>
              删除
            </Button>
            <Button onClick={closeModal}>关闭</Button>
          </Space>
        }
      >
        <Card className={styles.cardItem} info={detail} detailMode />
      </Modal>
    </Page>
  );
};
