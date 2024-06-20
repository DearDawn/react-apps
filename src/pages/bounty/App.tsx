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
import { myPost, useFetch } from '@/utils/fetch';
import { PieceInfo, LevelMap, PriorityMap } from './constant';
import { Card } from './components/card';
import { useCardDetailModal } from '@/utils/hooks';

export const App = () => {
  const [createModalVisible, showCreateModal, closeCreateModal] = useBoolean();

  const { form } = useFormState<PieceInfo>();
  const { data: listData = [], runApi } = useFetch<PieceInfo[]>({
    url: '/bounty/list',
    autoRun: true,
    loadingFn: () => loading('列表加载中...', undefined, false),
  });

  const { handleClickCard, closeModal, detail, modalVisible } =
    useCardDetailModal<PieceInfo>({ listData });

  const isEditMode = !!detail && createModalVisible;

  const finishTodo = () => {
    myPost('/bounty/finish', {}, { id: detail?._id }).then(() => {
      closeModal();
      runApi();
    });
  };

  const cancelTodo = () => {
    myPost('/bounty/cancel', {}, { id: detail?._id }).then(() => {
      closeModal();
      runApi();
    });
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

    myPost<PieceInfo>('/bounty/update', {}, data).then(() => {
      form.resetField();
      closeCreateModal();
      toast('修改成功');
      runApi();
    });
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

    myPost<PieceInfo>('/bounty/create', {}, data).then(() => {
      form.resetField();
      closeCreateModal();
      runApi();
    });
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
    if (createModalVisible && detail) {
      form.setFieldsValue(detail);
    }
  }, [createModalVisible, detail, form]);

  return (
    <Page maxWidth='100vw' minWidth='300px' className={styles.app}>
      <Header title='赏金猎人' isSticky />
      <div className={styles.list}>
        {listData?.map((it, idx) => (
          <Card info={it} key={it._id} onClick={handleClickCard(idx, it)} />
        ))}
      </div>
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
