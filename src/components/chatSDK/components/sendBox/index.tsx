import React from 'react';
import * as styles from './index.module.less';
import {
  useFormState,
  Form,
  Textarea,
  Input,
  Button,
  Icon,
  ICON,
  waitTime,
} from 'sweet-me';
import { FileList } from '../fileList';

interface IProps {
  onSend: (value: { text: string; file: File }) => void;
  fileAccept?: string;
  form: ReturnType<typeof useFormState>['form'];
}

export const SendBox = (props: IProps) => {
  const { form, onSend, fileAccept } = props || {};

  const handleFileChange = React.useCallback(
    async (_file: any) => {
      const file = _file as File;

      if (!file) return;

      await waitTime(500);
      form.dispatchSubmit();
    },
    [form]
  );

  const handleDeleteFile = () => {
    form.setFieldValue('file', undefined);
  };

  const handleSubmit = (values) => {
    onSend(values);
  };

  return (
    <Form className={styles.footer} form={form} onSubmit={handleSubmit}>
      <FileList className={styles.fileList} onDelete={handleDeleteFile} />
      <Form.Item noMargin field='text' className={styles.inputWrap}>
        <Textarea className={styles.input} placeholder='请输入...' />
      </Form.Item>
      <Form.Item noMargin field='file' className={styles.inputFile}>
        <Input.File accept={fileAccept} onValueChange={handleFileChange}>
          <Button className={styles.inputFileBtn}>
            <Icon type={ICON.file} />
          </Button>
        </Input.File>
      </Form.Item>
      <Button className={styles.submit} type='submit'>
        发送
      </Button>
    </Form>
  );
};
