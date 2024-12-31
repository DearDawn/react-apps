import * as React from 'react';
import * as styles from './App.module.less';
import {
  Page,
  Header,
  Button,
  Form,
  useFormState,
  Icon,
  ICON,
  toast,
  Input,
  Modal,
  Space,
  useBoolean,
} from 'sweet-me';
import { socket } from './socket';
import {
  useDragEvent,
  useEnterKeyDown,
  usePageFocus,
  usePasteEvent,
} from './hooks';
import clsx from 'clsx';
import { ROOM_ID, PageContext } from './constants';
import { useSocket } from '@/components/chatSDK';
import { SendBox } from '../demo/components/chat/components/sendBox';
import { ChatContext } from '@/components/chatSDK/context';
import { MessageList } from '../demo/components/chat/components/messageList';

export const App = () => {
  const { form } = useFormState();
  const { form: roomInputForm } = useFormState();
  const [roomInputVisible, showRoomInput, closeRoomInput] = useBoolean(false);
  const {
    socketID,
    messageList,
    sendData,
    onlineCount,
    isMe,
    isOnline,
    fileMap,
    progressMap,
    needScrollToBottom,
    getFileInfo,
  } = useSocket({
    socket,
    roomID: ROOM_ID,
    onSendEnd: () => {
      form.resetField();
      console.log('[dodo] ', 'sendEnd', 123);
    },
  });

  const { isPageFocused } = usePageFocus();

  const handleRooms = React.useCallback(() => {
    socket.emit('rooms');
  }, []);

  const handleCloseRoomInput = React.useCallback(() => {
    roomInputForm.resetField();
    closeRoomInput();
  }, [closeRoomInput, roomInputForm]);

  const handleChangeRoom = React.useCallback(
    (values) => {
      if (!roomInputForm.validate()) {
        return toast('未填写完整');
      }

      const room = values.room?.trim();

      if (room === ROOM_ID) {
        return closeRoomInput();
      }

      const currentUrl = new URL(window.location.href);
      const searchParams = new URLSearchParams(currentUrl.search);
      searchParams.set('room', room);
      currentUrl.search = searchParams.toString();
      window.location.replace(currentUrl.href);
    },
    [closeRoomInput, roomInputForm]
  );

  const handlePasteOrDrop = async (data: DataTransfer) => {
    console.log('[dodo] ', 'data', data, data.types, data.files[0]);

    if (data.types.includes('text/plain')) {
      const pastedText = data.getData('text/plain');
      const currentText = form.getFieldValue('text') || '';
      form.setFieldValue('text', `${currentText}${pastedText}`);
    }

    if (data.types.includes('Files')) {
      const file = data.files[0];

      form.setFieldValue('file', file);
    }
  };

  const { isDragging } = useDragEvent(handlePasteOrDrop);
  usePasteEvent(handlePasteOrDrop);
  useEnterKeyDown(form.dispatchSubmit);

  return (
    <PageContext.Provider value={{ fileMap, progressMap, socketID }}>
      <ChatContext.Provider
        value={{
          messageList,
          sendData,
          onlineCount,
          socketID,
          isMe,
          isOnline,
          fileMap,
          needScrollToBottom,
          progressMap,
          getFileInfo,
        }}
      >
        <Page
          minWidth='300px'
          className={clsx(styles.app, {
            [styles.blur]: !isPageFocused,
            [styles.isDragging]: isDragging,
            [styles.isOffline]: !isOnline,
          })}
        >
          <Header
            title={
              <div className={styles.title} onClick={showRoomInput}>
                共享 (房间号：{ROOM_ID})
              </div>
            }
            isSticky
            rightPart={<Icon type={ICON.sugar} onClick={handleRooms} />}
          />
          <MessageList />
          <SendBox onSend={sendData} form={form} />
          <Modal
            visible={roomInputVisible}
            onClose={handleCloseRoomInput}
            maskClosable
          >
            <Form form={roomInputForm} onSubmit={handleChangeRoom}>
              <Form.Item
                field='room'
                required
                defaultValue={ROOM_ID}
                label='房间号'
              >
                <Input placeholder='房间号' />
              </Form.Item>
              <Space stretch padding='5px 0 0'>
                <Button status='error' onClick={handleCloseRoomInput}>
                  取消
                </Button>
                <Button status='success' type='submit'>
                  确认
                </Button>
              </Space>
            </Form>
          </Modal>
        </Page>
      </ChatContext.Provider>
    </PageContext.Provider>
  );
};
