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
import {
  formatFile,
  formatText,
  getBlob,
  mergeArrays,
  splitFiles,
} from './utils';
import { FileList } from './components/fileList';
import {
  FileT,
  IFileType,
  ImgT,
  ROOM_ID,
  ServerFile,
  ServerFileRes,
  ServerHistory,
  ServerText,
  ServerTextRes,
} from './constants';

export const App = () => {
  const { form } = useFormState();
  const [messageList, setMessageList] = React.useState<Array<IFileType>>([]);
  const listRef = React.useRef<HTMLDivElement>(null);
  const bottomHolderRef = React.useRef<HTMLDivElement>(null);
  const [isMe, setIsMe] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(false);
  const { scrollToBottom } = useAutoScrollToBottom({ listRef, force: isMe }, [
    messageList,
  ]);
  const { showBack } = useShowBackToBottom({ listRef, bottomHolderRef });
  const { isPageFocused } = usePageFocus();
  const onlineController = React.useRef();

  const handleFileChange = React.useCallback(
    async (_file: any) => {
      const file = _file as File;

      if (!file) return;

      console.log('[dodo] ', 'file', file.size, file.name);

      await waitTime(500);
      form.dispatchSubmit();
    },
    [form]
  );

  const handleDeleteFile = () => {
    form.setFieldValue('file', undefined);
  };

  const sendData = (values: { text: string; file: File }) => {
    const { text = '', file } = values || {};

    if (text.trim()) {
      socket.emit('text', text);
    }

    if (file) {
      const chunks = splitFiles({ file });
      console.log('[dodo] ', 'chunks', chunks);
      chunks.forEach((chunk, index) => {
        socket.emit('file', {
          file: chunk,
          name: file.name,
          mimeType: file.type,
          index,
          totalChunks: chunks.length,
        });
      });
    }

    form.resetField();
  };

  const handleSubmit = React.useCallback(async (values) => {
    console.log('[dodo] ', 'socket.connected', socket.connected);
    if (socket.connected) {
      sendData(values);
    } else {
      socket.once('connect', () => sendData(values));
    }
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

  const handleCopyImage = (img: ImgT) => async () => {
    const { url, file } = img || {};

    // safari 需要通过传入 promise 实现，不可先获取结果
    const getImgBold = async (): Promise<Blob> => {
      return file.type === 'image/png' ? file : await getBlob(url);
    };

    navigator.clipboard
      .write([new ClipboardItem({ 'image/png': getImgBold() })])
      .then(function () {
        toast('图片已复制到剪贴板');
      })
      .catch(function (error) {
        toast('复制失败');
        console.error('Failed to copy image data:', error);
      });
  };

  const handlePasteOrDrop = async (data: DataTransfer) => {
    console.log('[dodo] ', 'clipboardData', data, data.types);

    if (data.types.includes('text/plain')) {
      const pastedText = data.getData('text/plain');
      const currentText = form.getFieldValue('text') || '';
      form.setFieldValue('text', `${currentText}${pastedText}`);
    }

    if (data.types.includes('Files')) {
      const file = data.files[0];

      form.setFieldValue('file', file);
      await waitTime(500);
      form.dispatchSubmit();
    }
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
      setIsOnline(true);
    });

    socket.on('disconnect', () => {
      console.log('[dodo] ', 'out');
      setIsOnline(false);
      // 断开连接时自动重新连接
      // socket.io.opts.transports = ['websocket'];
    });

    socket.on('text', (val: ServerTextRes, clientId) => {
      console.log('[dodo] ', 'get text', val, clientId);
      setMessageList((list) => list.concat(formatText(val)));
      setIsMe(socket.id === clientId);
    });

    socket.on('history', (historyList: ServerHistory = []) => {
      const newList = historyList.map((it) => {
        if (it.type === 'text') {
          return formatText(it);
        }
        return formatFile(it);
      });

      console.log('[dodo] ', 'get history', historyList, newList);
      setMessageList((list) => mergeArrays(list, newList));
      setTimeout(scrollToBottom, 500);
    });

    socket.on('file', (fileInfo: ServerFileRes, clientId) => {
      console.log('[dodo] ', 'get file', fileInfo, clientId);
      setMessageList((list) => list.concat(formatFile(fileInfo)));
      setIsMe(socket.id === clientId);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [scrollToBottom]);

  const { isDragging } = useDragEvent(handlePasteOrDrop);
  usePasteEvent(handlePasteOrDrop);
  useEnterKeyDown(form.dispatchSubmit);

  return (
    <Page
      minWidth='300px'
      className={clsx(styles.app, {
        [styles.blur]: !isPageFocused,
        [styles.isDragging]: isDragging,
        [styles.isOffline]: !isOnline,
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
        <FileList className={styles.fileList} onDelete={handleDeleteFile} />
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
