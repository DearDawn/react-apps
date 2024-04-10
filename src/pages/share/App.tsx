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
  const { scrollToBottom } = useAutoScrollToBottom({ listRef }, [messageList]);
  const { showBack } = useShowBackToBottom({ listRef, bottomHolderRef });
  const { isPageFocused } = usePageFocus();

  const handleFileChange = React.useCallback((file) => {
    if (file) {
      socket.emit('file', { file, name: file.name, mimeType: file.type });
      // form.resetField();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = React.useCallback((values) => {
    const { text = '' } = values || {};

    if (text.trim()) {
      socket.emit('text', text);
    }

    form.resetField();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setTimeout(scrollToBottom, 500);
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
  }, [scrollToBottom]);

  const handlePasteOrDrop = (clipboardData: DataTransfer) => {
    if (clipboardData.types.includes('text/plain')) {
      const pastedText = clipboardData.getData('text/plain');
      form.setFieldValue('text', pastedText);
    }

    if (clipboardData.types.includes('Files')) {
      const file = clipboardData.files[0];

      form.setFieldValue(file, file);

      // 手动触发 change 事件
      // fileRef.current.dispatchEvent(
      //   new Event('change', { bubbles: true, cancelable: true })
      // );
    }
  };

  const { isDragging } = useDragEvent(handlePasteOrDrop);
  usePasteEvent(handlePasteOrDrop);
  useEnterKeyDown(() => {
    form.formRef.current.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      })
    );
  });

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
