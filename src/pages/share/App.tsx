import * as React from 'react';
import * as styles from './App.module.less';
import { Page, Header, Button, Form, useFormState, Textarea, Icon, ICON, toast } from 'sweet-me';
import { socket } from './socket';

const ROOM_ID = 'dodo';

const formatText = (content = ''): IFileType => {
  return { type: 'text', content };
};

const formatFile = (fileInfo: { buffer: ArrayBuffer, name: string, mimeType: string }): IFileType => {
  const { buffer, name, mimeType } = fileInfo || {};
  const file = new File([buffer], name, { type: mimeType });
  const fileUrl = URL.createObjectURL(file);

  if (mimeType.startsWith('image/')) {
    return {
      type: 'img',
      fileName: name,
      url: fileUrl
    };
  }

  return {
    type: 'file',
    content: new TextDecoder().decode(buffer),
    fileName: name,
    mimeType,
    url: fileUrl
  };
};


type IFileType = { type: 'text', content: string } |
{ type: 'img', url: string, fileName: string } |
{ type: 'file', content: string, url: string, fileName: string, mimeType: string };

export const App = () => {
  const { form } = useFormState();
  const [messageList, setMessageList] = React.useState<Array<IFileType>>([]);
  const fileRef = React.useRef(null);

  const handleFileChange = React.useCallback(() => {
    const file = fileRef.current.files[0];
    console.log('[dodo] ', 'fiel', file);
    socket.emit('file', { file, name: file.name, mimeType: file.type });
  }, []);

  const handleSubmit = React.useCallback((values) => {
    console.log('[dodo] ', 'values', values);

    const { text = '' } = values || {};

    if (text.trim()) {
      socket.emit('text', text);
    }

    form.resetField();
  }, []);

  const handleCopyText = (text = '') => () => {
    navigator.clipboard.writeText(text)
      .then(function () {
        toast('文案已复制到剪贴板');
      })
      .catch(function (error) {
        toast('复制失败');
        console.error('Failed to copy text:', error);
      });
  };

  React.useEffect(() => {
    // 连接到服务器
    socket.on('connect', () => {
      console.log('[dodo] ', 'Connected to server', socket.id);
      socket.emit('join', ROOM_ID);
    });

    socket.on('text', (val) => {
      console.log('[dodo] ', 'get text', val);
      setMessageList((list) => list.concat(formatText(val)));
    });

    socket.on('history', (historyList = []) => {
      const newList = historyList.map((it: { type: string, data: any }) => {
        if (it.type === 'text') {
          return formatText(it.data);
        }
        return formatFile(it.data);
      });

      console.log('[dodo] ', 'get history', newList);
      setMessageList((list) => list.concat(...newList));
    });

    socket.on('file', (fileInfo: { buffer: ArrayBuffer, name: string, mimeType: string }) => {
      console.log('[dodo] ', 'get file', fileInfo);
      setMessageList((list) => list.concat(formatFile(fileInfo)));
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
          <div className={styles.itemWrap} key={idx}>
            {it.type === 'text' && (
              <div className={styles.textItem} onClick={handleCopyText(it.content)}>
                {it.content}
                <Icon className={styles.copyIcon} type={ICON.copy} />
              </div>
            )}
            {it.type === 'img' && (
              <div>
                <img src={it.url} alt={it.fileName} />
              </div>
            )}
            {it.type === 'file' && (
              <div>
                <a href={it.url} download={it.fileName}>下载 {it.fileName}</a>
              </div>
            )}
          </div>
        ))}
      </div>
      <Form className={styles.footer} form={form} onSubmit={handleSubmit}>
        <input type="file" ref={fileRef} onChange={handleFileChange} />
        <Form.Item noMargin field='text' className={styles.inputWrap}>
          <Textarea className={styles.input} placeholder='请输入...' />
        </Form.Item>
        <Button className={styles.submit} type='submit'>发送</Button>
      </Form>
    </Page >
  );
};
