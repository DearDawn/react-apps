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
  Input,
} from 'sweet-me';
import { socket } from './socket';
import {
  useAutoScrollToBottom,
  useDragEvent,
  useEnterKeyDown,
  usePageFocus,
  usePasteEvent,
  useShowBackToBottom,
} from './hooks';
import clsx from 'clsx';
import { waitTime } from '@/utils';
import { getBlob } from './utils';
// import { waitTime } from '@/utils';

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
  const listRef = React.useRef<HTMLDivElement>(null);
  const bottomHolderRef = React.useRef<HTMLDivElement>(null);
  const [isMe, setIsMe] = React.useState(false);
  const { scrollToBottom } = useAutoScrollToBottom({ listRef, force: isMe }, [
    messageList,
  ]);
  const { showBack } = useShowBackToBottom({ listRef, bottomHolderRef });
  const { isPageFocused } = usePageFocus();

  const handleFileChange = React.useCallback(
    (file) => {
      if (!file) return;

      form.dispatchSubmit();
    },
    [form]
  );

  const handleSubmit = React.useCallback(
    (values) => {
      const { text = '', file } = values || {};

      if (text.trim()) {
        socket.emit('text', text);
      }

      if (file) {
        socket.emit('file', { file, name: file.name, mimeType: file.type });
      }

      form.resetField();
    },
    [form]
  );

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

  const handleCopyImage = (img: ImgT) => async () => {
    const { url, file } = img || {};
    const imgBold: Blob = file.type === 'image/png' ? file : await getBlob(url);

    navigator.clipboard
      .write([new ClipboardItem({ 'image/png': imgBold })])
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

    socket.on('text', (val, clientId) => {
      console.log('[dodo] ', 'get text', val, clientId);
      setMessageList((list) => list.concat(formatText(val)));
      setIsMe(socket.id === clientId);
    });

    socket.on('history', (historyList = [], clientId) => {
      const newList = historyList.map((it: { type: string; data: any }) => {
        if (it.type === 'text') {
          return formatText(it.data);
        }
        return formatFile(it.data);
      });

      console.log('[dodo] ', 'get history', newList);
      setMessageList((list) => list.concat(...newList));
      setTimeout(scrollToBottom, 500);
    });

    socket.on(
      'file',
      (
        fileInfo: { buffer: ArrayBuffer; name: string; mimeType: string },
        clientId
      ) => {
        console.log('[dodo] ', 'get file', fileInfo, clientId);
        setMessageList((list) => list.concat(formatFile(fileInfo)));
        setIsMe(socket.id === clientId);
      }
    );

    return () => {
      socket.removeAllListeners();
    };
  }, [scrollToBottom]);

  const handlePasteOrDrop = async (data: DataTransfer) => {
    console.log('[dodo] ', 'clipboardData', data, data.types);

    if (data.types.includes('text/plain')) {
      const pastedText = data.getData('text/plain');
      form.setFieldValue('text', pastedText);
    }

    if (data.types.includes('Files')) {
      const file = data.files[0];

      form.setFieldValue('file', file);
      await waitTime(500);
      form.dispatchSubmit();
    }
  };

  const { isDragging } = useDragEvent(handlePasteOrDrop);
  usePasteEvent(handlePasteOrDrop);
  useEnterKeyDown(form.dispatchSubmit);

  return (
    <Page
      minWidth='300px'
      className={clsx(styles.app, {
        [styles.blur]: !isPageFocused,
        [styles.isDragging]: isDragging,
      })}
    >
      <Header title='共享' isSticky />
      <div className={styles.contentWrap} ref={listRef}>
        {messageList.map((it, idx) => (
          <div className={styles.itemWrap} key={idx} draggable={false}>
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
                  type={ICON.download}
                  title='下载'
                  onClick={handleDownloadFile(it)}
                />
              </div>
            )}
            {it.type === 'file' && (
              <div className={styles.fileItem}>
                <Icon className={styles.fileIcon} type={ICON.file} size={40} />
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
        <div className={styles.holder} ref={bottomHolderRef} />
      </div>
      <Button
        className={clsx(styles.rocketBottom, showBack && styles.visible)}
        onClick={scrollToBottom}
      >
        <Icon type={ICON.rocket} />
      </Button>
      <Form className={styles.footer} form={form} onSubmit={handleSubmit}>
        <Form.Item noMargin field='text' className={styles.inputWrap}>
          <Textarea className={styles.input} placeholder='请输入...' />
        </Form.Item>
        <Form.Item noMargin field='file' className={styles.inputFile}>
          <Input.File onValueChange={handleFileChange}>
            <Button className={styles.inputFileBtn}>
              <Icon type={ICON.file} />
            </Button>
          </Input.File>
        </Form.Item>
        <Button className={styles.submit} type='submit'>
          发送
        </Button>
      </Form>
    </Page>
  );
};
