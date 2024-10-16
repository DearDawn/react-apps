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
  useFormState,
  Textarea,
  InputImage,
  ScrollContainer,
  Space,
} from 'sweet-me';
import { myPost, useListFetch } from '@/utils/fetch';
import { FormPieceInfo, PieceInfo } from './constants';
import { Card } from './components/card';
import { useCardDetailModal } from '@/utils/hooks';
import { imageUploader } from '@/utils/image';

export const App = () => {
  const [createModalVisible, showCreateModal, closeCreateModal] = useBoolean();
  const [isLoading, startLoading, endLoading] = useBoolean();

  const { form } = useFormState<FormPieceInfo>();
  const { data, onRefresh, onLoadMore, refreshing } = useListFetch<PieceInfo>({
    url: '/piece/list',
    autoRun: true,
    loadingFn: () => loading('列表加载中...', undefined, false),
  });
  const { list: listData } = data || {};
  const { handleClickCard, closeModal, detail, modalVisible } =
    useCardDetailModal<PieceInfo>({ listData });
  const loadingCb = React.useRef(() => {});
  const isEditMode = !!detail && createModalVisible;

  const handleEdit = () => {
    const pass = form.validate();

    if (!pass) {
      toast('请完整填写内容');
      return;
    }

    const values = form.getFieldsValue();

    const { title = '', content = '', image, link, tag } = values;
    const { url } = image || {};

    const data: Record<string, any> = {
      title: title.trim(),
      content: content.trim(),
      link: link?.trim(),
      image: url,
      tag: tag,
      id: detail?._id,
    };

    startLoading();
    myPost<PieceInfo>('/piece/update', {}, data)
      .then(() => {
        form.resetField();
        closeCreateModal();
        toast('修改成功');
        onRefresh();
      })
      .finally(endLoading);
  };

  const handleCreate = React.useCallback(() => {
    const pass = form.validate();

    if (!pass) {
      toast('请完整填写内容');
      return;
    }

    const values = form.getFieldsValue();
    const { title = '', content = '', image, link, tag } = values;
    const { url } = image || {};

    myPost<PieceInfo>(
      '/piece/create',
      {},
      {
        title: title.trim(),
        content: content.trim(),
        link: link?.trim(),
        tag: tag?.trim(),
        image: url,
      }
    )
      .then((res: any) => {
        if (res?.message) {
          toast(res?.message);
        } else {
          console.log('[dodo] ', 'res', res);
          form.resetField();
          closeCreateModal();
          onRefresh();
        }
      })
      .catch(console.error);
  }, [closeCreateModal, form, onRefresh]);

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
      <Header title='完整 & 破碎' isSticky />
      <ScrollContainer
        className={styles.scrollContainer}
        refreshing={refreshing}
        onPullDownRefresh={onRefresh}
        onLoadMore={onLoadMore}
      >
        <div className={styles.list}>
          {listData?.map((it) => (
            <Card info={it} key={it._id} onClick={handleClickCard(it)} />
          ))}
        </div>
      </ScrollContainer>
      <Button
        className={styles.addBtn}
        status='success'
        onClick={showCreateModal}
      >
        添加碎片
      </Button>
      <Modal className={styles.modal} visible={createModalVisible}>
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item field='title' labelClassName={styles.label} required>
              <Input className={styles.input} placeholder='标题' />
            </Form.Item>
            <Form.Item field='content' labelClassName={styles.label} required>
              <Textarea className={styles.input} placeholder='内容' />
            </Form.Item>
            <Form.Item field='link' labelClassName={styles.label}>
              <Textarea
                className={styles.input}
                placeholder='链接, 多个需换行'
              />
            </Form.Item>
            <Form.Item field='tag' labelClassName={styles.label}>
              <Textarea className={styles.input} placeholder='标签, 逗号分隔' />
            </Form.Item>
            <Form.Item field='image' labelClassName={styles.label}>
              <InputImage uploader={imageUploader} />
            </Form.Item>
            <div className={styles.btnWrap}>
              <Button
                className={styles.addBtn}
                status='error'
                onClick={closeCreateModal}
              >
                取消
              </Button>
              {isEditMode ? (
                <Button
                  className={styles.addBtn}
                  status='success'
                  onClick={handleEdit}
                >
                  保存
                </Button>
              ) : (
                <Button
                  className={styles.addBtn}
                  status='success'
                  onClick={handleCreate}
                >
                  添加
                </Button>
              )}
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
            {/* <Button onClick={showCreateModal} status='warning'>
              编辑
            </Button> */}
            <Button onClick={closeModal}>关闭</Button>
          </Space>
        }
      >
        <Card className={styles.cardItem} info={detail} modalMode />
      </Modal>
    </Page>
  );
};
