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
  loading,
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
import { formatFile, formatText, mergeArrays, splitFiles } from './utils';
import { FileList } from './components/fileList';
import {
  IFileType,
  ROOM_ID,
  PageContext,
  ServerFileContentRes,
  ServerFileRes,
  ServerHistory,
  ServerTextRes,
} from './constants';
import { FileStore, fileStore } from './fileStore';
import { FileItem } from './components/fileItem';

export const App = () => {
  const { form } = useFormState();
  const [messageList, setMessageList] = React.useState<Array<IFileType>>([]);
  const listRef = React.useRef<HTMLDivElement>(null);
  const bottomHolderRef = React.useRef<HTMLDivElement>(null);
  const [isMe, setIsMe] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(false);
  const [fileMap, setFileMap] = React.useState<FileStore['fileStoreMap']>(
    new Map()
  );
  const [progressMap, setProgressMap] = React.useState<
    FileStore['progressMap']
  >(new Map());
  const [socketID, setSocketID] = React.useState('');
  const { scrollToBottom } = useAutoScrollToBottom({ listRef, force: isMe }, [
    messageList,
  ]);
  const { showBack } = useShowBackToBottom({ listRef, bottomHolderRef });
  const { isPageFocused } = usePageFocus();
  const loadingRef = React.useRef(() => {});

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

  const sendData = (values: { text: string; file: File }) => {
    const { text = '', file } = values || {};

    if (text.trim()) {
      socket.emit('text', text);
    }

    if (file) {
      const chunks = splitFiles({ file });
      chunks.forEach((chunk, index) => {
        socket.emit('file', {
          file: chunk,
          name: file.name,
          mimeType: file.type,
          index,
          totalChunks: chunks.length,
        });
      });
      loadingRef.current = loading('发送中...');
    }

    form.resetField();
  };

  const handleSubmit = (values) => {
    sendData(values);
  };

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

  const handlePasteOrDrop = async (data: DataTransfer) => {
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

  React.useEffect(() => {
    // 连接到服务器
    socket.on('connect', () => {
      console.log('[dodo] ', 'Connected to server', socket.id);
      socket.emit('join', ROOM_ID);
      setIsOnline(true);
      setSocketID(socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[dodo] ', 'out');
      setIsOnline(false);
    });

    socket.on('text', (val: ServerTextRes, clientId) => {
      console.log('[dodo] ', 'get text', val, clientId);
      setMessageList((list) => list.concat(formatText(val)));
      setIsMe(socket.id === clientId);
    });

    socket.on('history', (historyList: ServerHistory = []) => {
      console.log('[dodo] ', 'get history', historyList);
      const newList = historyList.map((it) => {
        if (it.type === 'text') {
          return formatText(it);
        }
        return formatFile(it);
      });

      console.table(newList);
      setMessageList((list) => mergeArrays(list, newList));
      setTimeout(scrollToBottom, 500);
    });

    socket.on('file', (fileInfo: ServerFileRes, clientId) => {
      setMessageList((list) => list.concat(formatFile(fileInfo)));
      setIsMe(socket.id === clientId);
    });

    socket.on('fileContent', (fileInfo: ServerFileContentRes) => {
      const { index, fileID, totalChunks } = fileInfo;

      if (index < totalChunks - 1) {
        socket.emit('fileContent', fileID, index + 1);
      }

      fileStore.receive(fileInfo, setFileMap, setProgressMap);
    });

    socket.on('file_done', (fileID: string, clientId) => {
      console.log('[dodo] ', 'fileID done', fileID);
      loadingRef.current();
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [scrollToBottom]);

  const { isDragging } = useDragEvent(handlePasteOrDrop);
  usePasteEvent(handlePasteOrDrop);
  useEnterKeyDown(form.dispatchSubmit);

  return (
    <PageContext.Provider value={{ fileMap, progressMap, socketID }}>
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
                <FileItem className={styles.imgItem} fileInfo={it} />
              )}
              {it.type === 'file' && (
                <FileItem className={styles.fileItem} fileInfo={it} />
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
    </PageContext.Provider>
  );
};
