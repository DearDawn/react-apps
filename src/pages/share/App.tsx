import * as React from 'react';
import * as styles from './App.module.less';
import { Page, Header, Input, Button, Form, useFormState, Textarea } from 'sweet-me';
import { socket } from './socket';

const ROOM_ID = 'dodo';


export const App = () => {
  const { form } = useFormState();
  const [messageList, setMessageList] = React.useState<Array<{ type: string, content: string }>>([]);
  const fileRef = React.useRef(null);

  const handleFileChange = React.useCallback(() => {
    const file = fileRef.current.files[0];
    console.log('[dodo] ', 'fiel', file);
    socket.emit('file', file);
  }, []);

  const handleSubmit = React.useCallback((values) => {
    console.log('[dodo] ', 'values', values);

    const { text = '' } = values || {};

    if (text.trim()) {
      socket.emit('text', text);
    }

    form.resetField();
  }, []);

  React.useEffect(() => {
    // 连接到服务器
    socket.on('connect', () => {
      console.log('[dodo] ', 'Connected to server', socket.id);
      socket.emit('join', ROOM_ID);
    });

    socket.on('text', (val) => {
      console.log('[dodo] ', 'get text', val);
      setMessageList((list) => list.concat({ type: 'text', content: val }));
    });

    socket.on('file', (val: ArrayBuffer) => {
      console.log('[dodo] ', 'get file', val);
      setMessageList((list) => list.concat({ type: 'file', content: new TextDecoder().decode(val) }));
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  return (
    <Page minWidth='300px' className={styles.app}>
      <Header title="共享" isSticky />
      <div className={styles.contentWrap}>
        {messageList.map((it, idx) => (
          <div key={idx}>{it.content}</div>
        ))}
      </div>
      <Form className={styles.footer} form={form} onSubmit={handleSubmit}>
        <input type="file" ref={fileRef} onChange={handleFileChange} />
        <Form.Item noMargin field='text' className={styles.inputWrap}>
          <Textarea className={styles.input} placeholder='请输入...' />
        </Form.Item>
        <Button className={styles.submit} type='submit'>发送</Button>
      </Form>
    </Page>
  );
};
