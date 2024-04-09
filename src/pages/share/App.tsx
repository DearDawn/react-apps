import * as React from 'react';
import * as styles from './App.module.less';
import {
  Page,
  Header,
  Button,
  Form,
  useFormState,
  Textarea,
  Icon,
  ICON,
  toast,
} from 'sweet-me';
import { socket } from './socket';

const ROOM_ID = 'dodo';

const formatText = (content = ''): IFileType => {
  return { type: 'text', content };
};

const formatFile = (fileInfo: {
  buffer: ArrayBuffer;
  name: string;
  mimeType: string;
}): IFileType => {
  const { buffer, name, mimeType } = fileInfo || {};
  const file = new File([buffer], name, { type: mimeType });
  const fileUrl = URL.createObjectURL(file);

  if (mimeType.startsWith('image/')) {
    return {
      file,
      type: 'img',
      fileName: name,
      url: fileUrl,
    };
  }

  return {
    file,
    type: 'file',
    content: new TextDecoder().decode(buffer),
    fileName: name,
    mimeType,
    url: fileUrl,
  };
};

type TextT = { type: 'text'; content: string };
type ImgT = { type: 'img'; file: File; url: string; fileName: string };
type FileT = {
  file: File;
  type: 'file';
  content: string;
  url: string;
  fileName: string;
  mimeType: string;
};

type IFileType = TextT | ImgT | FileT;

export const App = () => {
  const { form } = useFormState();
  const [messageList, setMessageList] = React.useState<Array<IFileType>>([]);
  const fileRef = React.useRef(null);

  const handleFileChange = React.useCallback(() => {
    const file = fileRef.current.files[0];
    console.log('[dodo] ', 'fiel', file);
    socket.emit('file', { file, name: file.name, mimeType: file.type });
    fileRef.current.value = '';
  }, []);

  const handleSubmit = React.useCallback((values) => {
    console.log('[dodo] ', 'values', values);

    const { text = '' } = values || {};

    if (text.trim()) {
      socket.emit('text', text);
    }

    form.resetField();
  }, []);

  const handleCopyText =
    (text = '') =>
    () => {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          toast('文案已复制到剪贴板');
        })
        .catch(function (error) {
          toast('复制失败');
          console.error('Failed to copy text:', error);
        });
    };

  const handleCopyImage = (img: ImgT) => () => {
    const { file } = img || {};

    navigator.clipboard
      .write([
        new ClipboardItem({
          [file.type]: file,
        }),
      ])
      .then(function () {
        toast('图片已复制到剪贴板');
      })
      .catch(function (error) {
        toast('复制失败');
        console.error('Failed to copy image data:', error);
      });
  };

  const handleDownloadFile = (img: ImgT | FileT) => () => {
    const { url, fileName } = img || {};
    console.log('[dodo] ', 'file', url, fileName);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
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
      const newList = historyList.map((it: { type: string; data: any }) => {
        if (it.type === 'text') {
          return formatText(it.data);
        }
        return formatFile(it.data);
      });

      console.log('[dodo] ', 'get history', newList);
      setMessageList((list) => list.concat(...newList));
    });

    socket.on(
      'file',
      (fileInfo: { buffer: ArrayBuffer; name: string; mimeType: string }) => {
        console.log('[dodo] ', 'get file', fileInfo);
        setMessageList((list) => list.concat(formatFile(fileInfo)));
      }
    );

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  return (
    <Page minWidth='300px' className={styles.app}>
      <Header title='共享' isSticky />
      <div className={styles.contentWrap}>
        {messageList.map((it, idx) => (
          <div className={styles.itemWrap} key={idx}>
            {it.type === 'text' && (
              <div
                className={styles.textItem}
                onClick={handleCopyText(it.content)}
              >
                {it.content}
                <Icon
                  className={styles.copyIcon}
                  type={ICON.copy}
                  title='复制'
                />
              </div>
            )}
            {it.type === 'img' && (
              <div className={styles.imgItem}>
                <img
                  src={it.url}
                  alt={it.fileName}
                  onClick={handleCopyImage(it)}
                />
                <Icon
                  className={styles.copyIcon}
                  type={ICON.copy}
                  title='复制'
                  onClick={handleCopyImage(it)}
                />
                <Icon
                  className={styles.saveIcon}
                  type={ICON.file}
                  title='下载'
                  onClick={handleDownloadFile(it)}
                />
              </div>
            )}
            {it.type === 'file' && (
              <div className={styles.fileItem}>
                <Icon className={styles.fileIcon} type={ICON.file} />
                {it.fileName}
                <Icon
                  className={styles.saveIcon}
                  type={ICON.download}
                  title='下载'
                  onClick={handleDownloadFile(it)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Form className={styles.footer} form={form} onSubmit={handleSubmit}>
        <input type='file' ref={fileRef} onChange={handleFileChange} />
        <Form.Item noMargin field='text' className={styles.inputWrap}>
          <Textarea className={styles.input} placeholder='请输入...' />
        </Form.Item>
        <Button className={styles.submit} type='submit'>
          发送
        </Button>
      </Form>
    </Page>
  );
};
