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
  useFormState,
  Radio,
  Space,
  Tag,
} from 'sweet-me';
import { myPost } from '@/utils/fetch';
import { PieceInfo, LevelMap, PriorityMap } from './constant';
import { Card } from './components/card';
import { useCardDetailModal } from '@/utils/hooks';
import { ScrollContainer } from './components/scrollContainer';
import { useListRequest } from './useListRequest';

export const App = () => {
  const [createModalVisible, showCreateModal, closeCreateModal] = useBoolean();
  const [isLoading, startLoading, endLoading] = useBoolean();

  const { form } = useFormState<PieceInfo>();
  const { data, refreshing, onLoadMore, onRefresh } = useListRequest<PieceInfo>({
    url: '/bounty/list',
    loadingFn: () => loading('列表加载中...', undefined, false),
  });
  const { list: listData } = data || {};
  const loadingCb = React.useRef(() => {});

  const { handleClickCard, closeModal, detail, modalVisible } =
    useCardDetailModal<PieceInfo>({ listData });

  const isEditMode = !!detail && createModalVisible;

  const finishTodo = () => {
    startLoading();
    myPost('/bounty/finish', {}, { id: detail?._id })
      .then(() => {
        closeModal();
        onRefresh();
      })
      .finally(endLoading);
  };

  const cancelTodo = () => {
    startLoading();
    myPost('/bounty/cancel', {}, { id: detail?._id })
      .then(() => {
        closeModal();
        onRefresh();
      })
      .finally(endLoading);
  };

  const handleEdit = () => {
    const pass = form.validate();

    if (!pass) {
      toast('请完整填写内容');
      return;
    }

    const values = form.getFieldsValue();
    const { title = '', content = '', priority, level } = values;

    const data: Record<string, any> = {
      title: title.trim(),
      content: content.trim(),
      priority,
      level,
      id: detail?._id,
    };

    startLoading();
    myPost<PieceInfo>('/bounty/update', {}, data)
      .then(() => {
        form.resetField();
        closeCreateModal();
        toast('修改成功');
        onRefresh();
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
    const { title = '', content = '', priority, level } = values;

    const data = {
      title: title.trim(),
      content: content.trim(),
      priority,
      level,
    };

    startLoading();
    myPost<PieceInfo>('/bounty/create', {}, data)
      .then(() => {
        form.resetField();
        closeCreateModal();
        onRefresh();
      })
      .finally(endLoading);
  };

  const handleEditTodo = () => {
    showCreateModal();
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
      <Header title='赏金猎人' isSticky />
      <ScrollContainer
        className={styles.scrollContainer}
        onPullDownRefresh={onRefresh}
        onLoadMore={onLoadMore}
        refreshing={refreshing}
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
        添加赏金任务
      </Button>
      <Modal className={styles.modal} visible={createModalVisible}>
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item field='title' labelClassName={styles.label} required>
              <Input className={styles.input} placeholder='摘要' />
            </Form.Item>
            <Form.Item field='content' labelClassName={styles.label} required>
              <Textarea className={styles.input} placeholder='备注' />
            </Form.Item>
            <Form.Item
              field='priority'
              labelClassName={styles.labelWithText}
              required
              defaultValue={20}
              label='时效'
            >
              <Radio
                className={styles.priority}
                type='radio'
                options={Object.entries(PriorityMap).map(([key, val]) => ({
                  label: <Tag color={val.color}>{val.text}</Tag>,
                  value: Number(key),
                }))}
              />
            </Form.Item>
            <Form.Item
              field='level'
              className={styles.formItemZ1}
              labelClassName={styles.labelWithText}
              required
              defaultValue={20}
              label='难度'
            >
              <Radio
                className={styles.level}
                type='radio'
                options={Object.entries(LevelMap).map(([key, val]) => ({
                  label: <Tag color={val.color}>{val.text}</Tag>,
                  value: Number(key),
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
            {!detail?.status && (
              <>
                <Button onClick={finishTodo} status='success'>
                  完成
                </Button>
                <Button onClick={cancelTodo} status='error'>
                  终止
                </Button>
                <Button onClick={handleEditTodo} status='warning'>
                  编辑
                </Button>
              </>
            )}
            <Button onClick={closeModal}>关闭</Button>
          </Space>
        }
      >
        <Card className={styles.cardItem} info={detail} />
      </Modal>
    </Page>
  );
};
